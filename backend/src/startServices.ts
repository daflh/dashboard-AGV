import { Server } from 'http';
import { Socket } from 'socket.io';
import { PNG } from 'pngjs';
import WebSocketService from './services/WebSocketService';
import MapProviderService, { MapData } from './services/MapProviderService';
import AgentsCommService from './services/AgentsCommService';
import DatabaseService from './services/DatabaseService';
import DummyAgentsGenerator from './services/DummyAgentsGenerator';
import { AgentCondition, AgentConfiguration, AgentsObj } from "./models/agent";

const MAP_NAME = "basement"; // should not be hard-coded
const USE_DUMMY_AGENTS = false; // for development & testing purpose

interface AgentControlState {
  agentId: number | null;
  lastControlTimestamp: number;
  linearX: number;
  angularZ: number;
}

export default function startServices(httpServer: Server) {
  const webSocketService = new WebSocketService(httpServer);
  const mapProviderService = new MapProviderService(MAP_NAME);
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
          agents[agent.id] = agent;
          agentsCommService.connectToAgent(agent);
        } else {
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

  agentsCommService.onMapData(async (agentId, mapData: any) => {
    const pixels = mapData.map_matrix;
    const maxVal = 100;
    const pngFile = new PNG({
      width: mapData.width,
      height: mapData.height
    });
    const chunks: any[] = [];
  
    for (let y = 0; y < pngFile.height; y++) {
      for (let x = 0; x < pngFile.width; x++) {
        const idx = (pngFile.width * y + x)
        const pngIdx = idx << 2
        let pixel = 255 - (pixels[y][x] / maxVal * 255)
        if (pixels[y][x] === -1) pixel = 0
  
        pngFile.data[pngIdx] = Math.min(pixel, 255)
        pngFile.data[pngIdx + 1] = Math.min(pixel, 255)
        pngFile.data[pngIdx + 2] = Math.min(pixel, 255)
        pngFile.data[pngIdx + 3] = pixels[y][x] >= 0 ? 0xff : 0x00
      }
    }

    pngFile.pack();
    pngFile.on('data', (chunk) => {
      chunks.push(chunk);
    });
    pngFile.on('end', () => {
      webSocketService.io.to('authenticatedRoom').emit('agent:mapUpdated', agentId, {
        width: mapData.width,
        height: mapData.height,
        resolution: mapData.resolution,
        origin: [0, 0, 0],
        content: Buffer.concat(chunks).toString('base64')
      });
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
        agent.site = "Site " + agent.siteId;
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
      if (direction === "forward") agentControlState.linearX = 1;
      else if (direction === "backward") agentControlState.linearX = -1;
      else if (direction === "left") agentControlState.angularZ = 1;
      else if (direction === "right") agentControlState.angularZ = -1;
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
    
    socket.on('slamMap:get', (cb: (mapData: MapData | null) => void) => {
      const mapData = mapProviderService.getMap();
      cb(mapData);
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
