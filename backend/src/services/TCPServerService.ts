import { createServer } from 'net';
import { EventEmitter } from 'events';

class TCPServerService {
  private host: string;
  private port: number;
  private logTitle: string | null;
  private eventEmitter: EventEmitter;

  constructor(serverHost: string, serverPort: number, logTitle?: string) {
    this.host = serverHost;
    this.port = serverPort;
    this.logTitle = logTitle ?? null;
    this.eventEmitter = new EventEmitter();

    this.createTcpServer();
  }

  public onClientData(cb: (data: any) => void) {
    this.eventEmitter.on('dataReceived', cb);
  }

  public emitDataToClient(data: string) {
    this.eventEmitter.emit('dataToSend', data);
  }

  private get logPrefix() {
    return this.logTitle ? `TCP (${this.logTitle})` : 'TCP';
  }

  private createTcpServer() {
    const tcpServer = createServer((socket) => {
      console.log(this.logPrefix + ': Client connected');

      socket.on('data', (clientData) => {
        try {
          this.eventEmitter.emit('dataReceived', clientData.toString());
          // console.log(this.logPrefix + ': Data received', clientData.toString());
        } catch (err) {
          console.error(this.logPrefix + ': Error parsing data:', err);
        }
      });

      this.eventEmitter.on('dataToSend', (data) => {
        // console.log(this.logPrefix + ': Sending data:', data);
        socket.write(Buffer.from(data, 'utf-8'));
      });

      socket.on('end', () => {
        console.log(this.logPrefix + ': Client disconnected');
      });
    });

    tcpServer.listen(this.port, this.host, () => {
      console.log(this.logPrefix + ': Server is running on port ' + this.port);
    });
  }
}

export default TCPServerService;
