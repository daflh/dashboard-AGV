import { Server } from 'http';
import { Socket } from 'socket.io';
import WebSocketService from './services/WebSocketService';
import StaticMapService from './services/StaticMapService';
import AgentsCommService from './services/AgentsCommService';
import DatabaseService from './services/DatabaseService';
import DummyAgentsGenerator from './services/DummyAgentsGenerator';
import { AgentCondition, AgentConfiguration, AgentsObj, AgentControlState } from "./models/agent";
import { MapData } from "./models/map";
import { isTokenValid } from './auth';
import { convertMapToPng } from './utils/mapUtils';

const MAP_NAME = "turtlebot"; // should not be hard-coded
const USE_DUMMY_AGENTS = false; // for development & testing purpose

export default function startServices(httpServer: Server) {
  const webSocketService = new WebSocketService(httpServer);
  const staticMapService = new StaticMapService(MAP_NAME);
  const agentsCommService = new AgentsCommService();
  const databaseService = new DatabaseService(); // Using Prisma-based DatabaseService
  const dummyAgentGen = new DummyAgentsGenerator();

  const agents: AgentsObj = {};
  const agentControlState: AgentControlState = {
    agentId: null,
    lastControlTimestamp: 0,
    linearX: 0,
    angularZ: 0,
  };

  // Modify the updateAgentsFromDatabase function to be async
  async function updateAgentsFromDatabase() {
    try {
      const agentsUpToDate = USE_DUMMY_AGENTS
        ? dummyAgentGen.getAgents()
        : await databaseService.getAgents(); // Fetch agents from Prisma-based DatabaseService

      for (const agent of agentsUpToDate) {
        if (!agents[agent.id]) {
          // if the agent is not exists yet, add it and connect to it
          agents[agent.id] = agent;
          agentsCommService.connectToAgent(agent);
        } else {
          // if the agent's IP address has changed, connect to the new IP address
          if (agent.ipAddress !== agents[agent.id].ipAddress) {
            agentsCommService.connectToAgent(agent);
          }
          // if the agent already exists, update (override) the data
          agents[agent.id] = {
            ...agents[agent.id],
            ...agent,
          };
        }
      }
    } catch (error) {
      console.error("Failed to update agents from database", error);
    }
  }

  // Initial read of agents from the database
  updateAgentsFromDatabase();

  // validate JWT token
  webSocketService.io.use((socket, next) => {
    const socketAuth = socket.handshake.auth;
    
    if (socketAuth.token) {
      if (isTokenValid(socketAuth.token)) {
        next();
      } else {
        next(new Error("Invalid token"));
      }
    } else {
      next(new Error("No token provided"));
    }
  });

  // Handle status data
  agentsCommService.onStatusData((agentId, data: AgentCondition) => {
    if (agents[agentId]) {
      // Update the stored agent data
      agents[agentId] = {
        ...agents[agentId],
        ...data, // Now this will include the updated portStatus
      };
      webSocketService.io
        .to("authenticatedRoom")
        .emit("agent:updated", agentId, agents[agentId]); // Emit the full agent data
    }
  });

  agentsCommService.onMapData(async (agentId, mapData: MapData) => {
    const mapDataPng = await convertMapToPng(mapData, 100, true);

    webSocketService.io.to('authenticatedRoom').emit('agent:mapUpdated', agentId, {
      type: mapData.type || 'static',
      width: mapData.width,
      height: mapData.height,
      resolution: mapData.resolution,
      origin: mapData.origin,
      content: mapDataPng.base64
    });
  });

  if (USE_DUMMY_AGENTS) {
    dummyAgentGen.onAgentUpdate((agentId, data) => {
      if (agents[agentId]) {
        agents[agentId] = { ...agents[agentId], ...data };
        webSocketService.io
          .to("authenticatedRoom")
          .emit("agent:updated", agentId, data);
      }
    });
  }

  webSocketService.onClientConnection((socket: Socket) => {
    socket.join("authenticatedRoom");

    // Delete agent request
    socket.on("agent:delete", async (agentId: number, callback) => {
      try {
        await databaseService.deleteAgent(agentId);
        callback({ success: true, message: `Agent with ID ${agentId} deleted successfully.` });

        // Update local agent cache and notify all clients of deletion
        delete agents[agentId];
        webSocketService.io.to("authenticatedRoom").emit("agent:deleted", agentId);

        // Optionally, refresh the list of agents
        await updateAgentsFromDatabase();
      } catch (error) {
        console.error("Error deleting agent:", error);
        callback({ success: false, message: "Failed to delete agent." });
      }
    });

    // Handle add agent request
    socket.on("agent:add", async (newAgent: AgentConfiguration, callback) => {
      try {
        await databaseService.addAgent(newAgent);
        callback({ success: true, message: "Agent added successfully" });

        // Optionally refresh agents and notify clients
        await updateAgentsFromDatabase();
        webSocketService.io.to("authenticatedRoom").emit("agent:updated", newAgent);
      } catch (error) {
        console.error("Error adding agent:", error);
        callback({ success: false, message: "Failed to add agent" });
      }
    });

    // Handle edit agent request
    socket.on("agent:edit", async (updatedAgent: AgentConfiguration, callback) => {
      try {
        await databaseService.editAgent(updatedAgent);
        callback({ success: true, message: "Agent updated successfully" });

        await updateAgentsFromDatabase();
        webSocketService.io.to("authenticatedRoom").emit("agent:updated", updatedAgent.id, agents[updatedAgent.id]);
      } catch (error) {
        console.error("Error editing agent:", error);
        callback({ success: false, message: "Failed to update agent" });
      }
    });

    // Get all agents
    socket.on("agent:getAll", async (cb: (agentsData: AgentConfiguration[]) => void) => {
      await updateAgentsFromDatabase();

      const agentsArr = objectToArray(agents);
      for (const agent of agentsArr) {
        // agent.site = "Site " + agent.siteId;
        delete agent.siteId;
        agent.company = "Company " + agent.companyId;
        delete agent.companyId;
      }

      cb(agentsArr);
    });

    if (USE_DUMMY_AGENTS) dummyAgentGen.requestAgentsCondition();

    socket.on("agentCmd:direction", (agentId: number, direction: string) => {
      agentControlState.agentId = agentId;
      agentControlState.lastControlTimestamp = Date.now();
      if (direction === "forward") agentControlState.linearX = 0.25;
      else if (direction === "backward") agentControlState.linearX = -0.25;
      else if (direction === "left") agentControlState.angularZ = 0.25;
      else if (direction === "right") agentControlState.angularZ = -0.25;
    });

    // Fetch all sites
    socket.on("site:getAll", async (cb: (sitesData: any[]) => void) => {
      try {
        const sites = await databaseService.getSites();
        cb(sites);
      } catch (error) {
        console.error("Error fetching sites:", error);
        cb([]); // Return an empty array in case of error
      }
    });

// Create site request
socket.on("site:create", async (newSite: { name: string }, callback) => {
  try {
    if (!newSite.name) throw new Error("Site name is required");

    const site = await databaseService.createSite(newSite.name, 1);
    callback({ success: true, site });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating site:", error.message);
      callback({ success: false, message: error.message });
    } else {
      console.error("Unexpected error:", error);
      callback({ success: false, message: "An unexpected error occurred" });
    }
  }
});

    // Send direction control data at 2 Hz
    setInterval(() => {
      if (!agentControlState.agentId) return;
      if (agentControlState.lastControlTimestamp + 500 > Date.now()) {
        agentsCommService.sendControlCmd(
          agentControlState.agentId,
          agentControlState.linearX,
          agentControlState.angularZ
        );
      } else {
        agentsCommService.sendControlCmd(agentControlState.agentId, 0, 0);
        agentControlState.linearX = 0;
        agentControlState.angularZ = 0;
        agentControlState.agentId = null;
      }
    }, 500);

    socket.on('agentCmd:targetPosition', (agentId: number, positionStr: string) => {
      agentsCommService.sendNavigationCmd(agentId, positionStr);
    });
    
    socket.on('staticMap:request', async () => {
      if (!staticMapService.isMapLoaded) {
        await staticMapService.loadMap();
      }

      const mapData = staticMapService.getMap();
      if (mapData) {
        socket.emit('staticMap:response', {
          name: staticMapService.mapName,
          data: {
            width: mapData.width,
            height: mapData.height,
            resolution: mapData.resolution,
            origin: mapData.origin,
            content: mapData.base64
          }
        });
      }
    });
  });

  // Ensure Prisma disconnects when the server shuts down
  process.on('SIGINT', async () => {
    console.log("Disconnecting Prisma...");
    await databaseService.closeConnection();
    process.exit(0);
  });
}

function objectToArray(obj: object): any[] {
  return Object.entries(obj).map(([key, values]) => ({
    id: parseInt(key),
    ...values,
  }));
}
