import { Server, Socket } from 'socket.io';
import { EventEmitter } from 'events';

class WebSocketService {
  private io: Server;
  private eventEmitter: EventEmitter;

  constructor(io: Server) {
    this.io = io;
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
