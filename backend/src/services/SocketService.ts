import { Server, Socket } from 'socket.io';
import Agent from '../models/Agent';
import DummyAgentGenerator from '../utils/DummyAgentGenerator';

class SocketService {
  private io: Server;
  private dummyAgentGen: DummyAgentGenerator;

  constructor(io: Server) {
    this.io = io;
    this.dummyAgentGen = new DummyAgentGenerator();

    this.io.on('connection', this.handleConnection.bind(this));
  }

  private handleConnection(socket: Socket) {
    console.log('New client connected');

    socket.on('agent:get_all', (cb: (agentsData: Agent[]) => void) => {
      const agents = this.dummyAgentGen.getAllAgents();
      cb(agents);
    });

    this.dummyAgentGen.onAgentUpdate((agentId, newAgentData) => {
      socket.emit('agent:updated', agentId, newAgentData);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  }
}

export default SocketService;
