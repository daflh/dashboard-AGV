import AutoReconnectTCPClient from './AutoReconnectTCPClient';

class IntegrityCommService {
  static ITG_SERVER_IP = process.env.INTEGRITY_SERVER || 'localhost';
  static ITG_SERVER_PORT_SECURE = 1234;
  static ITG_SERVER_PORT_INSECURE = 1235;

  static MSG_DESIGNATOR = 'S0';
  static MSG_TAIL = 'e^&og\r\n\r\n';

  public bypassIntegrity: boolean;
  private responseTimeoutMs: number;
  private itgSecureTcpClient: AutoReconnectTCPClient;
  private itgInsecureTcpClient: AutoReconnectTCPClient;
  private isItgSecureTcpClientConnected: boolean;
  private isItgInsecureTcpClientConnected: boolean;

  constructor(bypassIntegrity: boolean = false) {
    this.responseTimeoutMs = 2000;
    this.itgSecureTcpClient = new AutoReconnectTCPClient(
      IntegrityCommService.ITG_SERVER_IP, IntegrityCommService.ITG_SERVER_PORT_SECURE
    );
    this.itgInsecureTcpClient = new AutoReconnectTCPClient(
      IntegrityCommService.ITG_SERVER_IP, IntegrityCommService.ITG_SERVER_PORT_INSECURE
    );
    this.isItgSecureTcpClientConnected = false;
    this.isItgInsecureTcpClientConnected = false;
    this.bypassIntegrity = bypassIntegrity;

    if (!this.bypassIntegrity) {
      this.startTcpClients();
    }
  }

  private startTcpClients() {
    this.itgSecureTcpClient.on('connect', () => {
      this.isItgSecureTcpClientConnected = true;
      console.log('IntegrityCommService: Connected to integrity secure server');
    });

    this.itgSecureTcpClient.on('close', () => {
      if (this.isItgSecureTcpClientConnected) {
        this.isItgSecureTcpClientConnected = false;
        console.log('IntegrityCommService: Integrity secure server disconnected');
      }
    });

    this.itgInsecureTcpClient.on('connect', () => {
      this.isItgInsecureTcpClientConnected = true;
      console.log('IntegrityCommService: Connected to integrity insecure server');
    });

    this.itgInsecureTcpClient.on('close', () => {
      if (this.isItgInsecureTcpClientConnected) {
        this.isItgInsecureTcpClientConnected = false;
        console.log('IntegrityCommService: Integrity insecure server disconnected');
      }
    });
  }

  public encryptData(data: string): Promise<string | null> {
    if (this.bypassIntegrity) {
      return Promise.resolve(data);
    }

    const packet = IntegrityCommService.MSG_DESIGNATOR + data + IntegrityCommService.MSG_TAIL;

    return new Promise((resolve, reject) => {
      this.itgInsecureTcpClient.write(packet, () => {
        // console.log('Packet sent to insecure server:', packet);
      });

      const responseTimeout = setTimeout(() => {
        console.log('IntegrityCommService: No response from integrity server within timeout');
        resolve(null);
      }, this.responseTimeoutMs);

      this.itgSecureTcpClient.once('data', (data) => {
        clearTimeout(responseTimeout);
        resolve(data.toString());
      });
    });
  }

  public decryptData(encrypted: string): Promise<string | null> {
    if (this.bypassIntegrity) {
      return Promise.resolve(encrypted);
    }

    const packet = IntegrityCommService.MSG_DESIGNATOR + encrypted.slice(2);

    return new Promise((resolve, reject) => {
      this.itgSecureTcpClient.write(packet, () => {
        // console.log('Packet sent to insecure server:', packet);
      });

      const responseTimeout = setTimeout(() => {
        console.log('No response from integrity server within timeout');
        resolve(null);
      }, this.responseTimeoutMs);

      this.itgInsecureTcpClient.once('data', (data) => {
        clearTimeout(responseTimeout);
        // strip designator and tail
        resolve(data.toString().slice(2, -9));
      });
    });
  }
}

export default IntegrityCommService;
