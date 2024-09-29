import { Server } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { EventEmitter } from 'events';

class WebSocketService {
  private socketServerOpts: object;
  public io: SocketServer;
  private eventEmitter: EventEmitter;

  constructor(httpServer: Server) {
    this.socketServerOpts = {
      cors: {
        origin: '*', 
        methods: ['GET', 'POST']
      }
    };
    this.io = new SocketServer(httpServer, this.socketServerOpts);
    this.eventEmitter = new EventEmitter();

    this.io.on('connection', this.handleClientConnection.bind(this));
  }

  public onClientConnection(cb: (socket: Socket) => void) {
    this.eventEmitter.on('clientConnection', cb);
  }

  private handleClientConnection(socket: Socket) {
    console.log('WebSocket: New client connected');

    this.eventEmitter.emit('clientConnection', socket);

    socket.on('disconnect', () => {
      console.log('WebSocket: Client disconnected');
    });
  }
}

export default WebSocketService;
