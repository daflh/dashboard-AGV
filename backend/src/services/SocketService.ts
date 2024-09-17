import { Server, Socket } from 'socket.io';
import Agent from '../models/Agent';
import DummyAgentGenerator from '../utils/DummyAgentGenerator';
import MapService, { MapData } from './MapService';

class SocketService {
  private io: Server;
  private mapService: MapService;
  private dummyAgentGen: DummyAgentGenerator;

  constructor(io: Server, mapService: MapService) {
    this.io = io;
    this.mapService = mapService;
    this.dummyAgentGen = new DummyAgentGenerator();

    this.io.on('connection', this.handleConnection.bind(this));
  }

  private handleConnection(socket: Socket) {
    console.log('New client connected');

    // get all agents
    socket.on('agent:getAll', (cb: (agentsData: Agent[]) => void) => {
      const agents = this.dummyAgentGen.getAllAgents();
      cb(agents);
    });

    this.dummyAgentGen.onAgentUpdate((agentId, newAgentData) => {
      socket.emit('agent:updated', agentId, newAgentData);
    });

    socket.on('slamMap:get', (cb: (mapData: MapData | null) => void) => {
      const mapData = this.mapService.getMap();
      cb(mapData);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  }
}

export default SocketService;
