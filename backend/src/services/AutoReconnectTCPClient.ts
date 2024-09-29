import { Socket } from 'net';

class AutoReconnectTCPClient extends Socket {
  private serverIp: string;
  private serverPort: number;
  private isConnected: boolean;

  constructor(serverIp: string, serverPort: number) {
    super();
    this.serverIp = serverIp;
    this.serverPort = serverPort;
    this.isConnected = false;

    // console.log(`tcp ${this.serverIp}:${this.serverPort} starting client`);

    this.connectAndRetryIndefinitely();
  }

  private connectAndRetryIndefinitely() {
    this.on('connect', () => {
      // console.log(`tcp ${this.serverIp}:${this.serverPort} connected`);
      this.isConnected = true;
    });
  
    this.on('error', () => {
      // console.log(`tcp ${this.serverIp}:${this.serverPort} failed to connect`);
      this.isConnected = false;
    });

    this.on('close', () => {
      // console.log(`tcp ${this.serverIp}:${this.serverPort} connection closed`);
      this.isConnected = false;
    });

    this.connectToServer();
    // retry every 3 seconds
    setInterval(() => {
      if (!this.isConnected) this.connectToServer();
    }, 3000);
  }

  private connectToServer() {
    // console.log(`tcp ${this.serverIp}:${this.serverPort} connecting...`);
    this.connect(this.serverPort, this.serverIp);
  }
}

export default AutoReconnectTCPClient;
