import { Server } from "http";
import { Socket } from "socket.io";
import WebSocketService from "./services/WebSocketService";
import MapProviderService, { MapData } from "./services/MapProviderService";
import AgentsCommService from "./services/AgentsCommService";
import DatabaseService from "./services/DatabaseService";
import DummyAgentsGenerator from "./services/DummyAgentsGenerator";
import {
  AgentCondition,
  AgentConfiguration,
  AgentsObj,
  Position2D,
} from "./models/agent";

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
  const databaseService = new DatabaseService(); // Modified database service
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
        : await databaseService.getAgents(); // Await for agents data from database

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
      console.error("Failed to update agents from database:", error);
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

  // Load SLAM map data from file
  mapProviderService.loadMap();

  webSocketService.onClientConnection((socket: Socket) => {
    // TODO: check authentication
    socket.join("authenticatedRoom");

    // Get all agents
    socket.on(
      "agent:getAll",
      async (cb: (agentsData: AgentConfiguration[]) => void) => {
        // Refresh agents data from the database
        await updateAgentsFromDatabase(); // Wait for agents data update

        const agentsArr = objectToArray(agents);
        for (const agent of agentsArr) {
          // TODO: get matching site and company names from the database
          agent.site = "Site " + agent.siteId;
          delete agent.siteId;
          agent.company = "Company " + agent.companyId;
          delete agent.companyId;
        }

        cb(agentsArr);
      }
    );

    if (USE_DUMMY_AGENTS) dummyAgentGen.requestAgentsCondition();

    socket.on("agentCmd:direction", (agentId: number, direction: string) => {
      agentControlState.agentId = agentId;
      agentControlState.lastControlTimestamp = Date.now();
      if (direction === "forward") {
        agentControlState.linearX = 1;
      } else if (direction === "backward") {
        agentControlState.linearX = -1;
      } else if (direction === "left") {
        agentControlState.angularZ = 1;
      } else if (direction === "right") {
        agentControlState.angularZ = -1;
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
        // Reset cmd if no command after 0.5 sec
        agentControlState.linearX = 0;
        agentControlState.angularZ = 0;
        agentControlState.agentId = null;
      }
    }, 500);

    socket.on(
      "agentCmd:targetPosition",
      (agentId: number, position: Position2D) => {
        agentsCommService.sendNavigationCmd(agentId, position);
      }
    );

    socket.on("slamMap:get", (cb: (mapData: MapData | null) => void) => {
      const mapData = mapProviderService.getMap();
      cb(mapData);
    });
  });
}

function objectToArray(obj: object): any[] {
  return Object.entries(obj).map(([key, values]) => ({
    id: parseInt(key),
    ...values,
  }));
}
