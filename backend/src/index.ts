import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import WebSocketService from './services/WebSocketService';
import MapProviderService, { MapData } from './services/MapProviderService';
import TCPServerService from './services/TCPServerService';
import DummyAgentGenerator from './utils/DummyAgentGenerator';
import Agent from './models/Agent';

const MAP_NAME = 'basement'; // should not be hard-coded

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8000;

const webSocketService = new WebSocketService(io);
const mapProviderService = new MapProviderService(MAP_NAME);
const agentDataService = new TCPServerService('0.0.0.0', 48192, 'Agent data');
const agentControlService = new TCPServerService('0.0.0.0', 48195, 'Agent control');
const dummyAgentGen = new DummyAgentGenerator();

webSocketService.onClientConnection((socket) => {
  // get all agents
  socket.on('agent:getAll', (cb: (agentsData: Agent[]) => void) => {
    const agents = dummyAgentGen.getAllAgents();
    cb(agents);
  });

  dummyAgentGen.onAgentUpdate((agentId, agentData) => {
    socket.emit('agent:updated', agentId, agentData);
  });

  agentDataService.onClientData((rawData) => {
    const data = JSON.parse(rawData);
    // FIXME: hardcoded agent id (amr1)
    socket.emit('agent:updated', 202409151505235, {
      linearVelocity: data.cmd_vel.linear,
      angularVelocity: data.cmd_vel.angular,
      odom: data.odom,
      imu: data.imu
    });
  });

  const cmd = { linear_x: 0, angular_z: 0 };
  let resetCmdTimeoutId: NodeJS.Timeout | null = null;

  socket.on('agentCmd:direction', (agentId: number, direction: string) => {
    // console.log(agentId, direction);

    // TODO: send with respect to the given agent id
    if (direction === 'forward') {
      cmd.linear_x = 1;
    } else if (direction === 'backward') {
      cmd.linear_x = -1;
    } else if (direction === 'left') {
      cmd.angular_z = 1;
    } else if (direction === 'right') {
      cmd.angular_z = -1;
    }

    // reset cmd if no command after 0.5 sec
    if (resetCmdTimeoutId) clearTimeout(resetCmdTimeoutId);
    resetCmdTimeoutId = setTimeout(() => {
      cmd.linear_x = 0;
      cmd.angular_z = 0;
      resetCmdTimeoutId = null;
    }, 500);
  });

  // send data to wasd control client for 2 Hz
  setInterval(() => {
    const message = JSON.stringify(cmd) + ';$';
    agentControlService.emitDataToClient(message);
  }, 500);

  socket.on('slamMap:get', (cb: (mapData: MapData | null) => void) => {
    const mapData = mapProviderService.getMap();
    cb(mapData);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
