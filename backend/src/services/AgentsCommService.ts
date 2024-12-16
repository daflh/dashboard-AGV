import { EventEmitter } from 'events';
import AutoReconnectTCPClient from './AutoReconnectTCPClient';
import { convert1DTo2DMap, fixMapRotation } from '../utils/mapUtils';
// import { patch } from '../utils/bsdiff';
import { AgentConfiguration, Quaternion } from '../models/agent';
import { MapData } from '../models/map';

class AgentsCommService {
  static GENERAL_PORT = 48100;
  static STATUS_DATA_PORT = 48101;
  static MAP_DATA_PORT = 48102;
  static CONTROL_CMD_PORT = 48201;
  static NAVIGATION_CMD_PORT = 48202;

  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  public connectToAgent(agent: AgentConfiguration) {
    if (agent.ipAddress) {
      console.log(`AgentsCommService: Starting TCP clients for ${agent.name} (${agent.ipAddress})`);
      this.startCommClient(agent.id, agent.ipAddress);
    }
  }

  public onStatusData(callback: (agentId: number, data: object) => void) {
    this.eventEmitter.on('statusData', callback);
  }

  public onMapData(callback: (agentId: number, data: MapData) => void) {
    this.eventEmitter.on('mapData', callback);
  }

  public sendControlCmd(agentId: number, linearX: number, angularZ: number) {
    this.eventEmitter.emit('controlCmd', agentId, linearX, angularZ);
  }

  public sendNavigationCmd(agentId: number, navigationStr: string) {
    this.eventEmitter.emit('navigationCmd', agentId, navigationStr);
  }

  private startCommClient(agentId: number, serverIp: string) {
    const generalTcpClient = new AutoReconnectTCPClient(serverIp, AgentsCommService.GENERAL_PORT);
    // const statusDataClient = new AutoReconnectTCPClient(serverIp, AgentsCommService.STATUS_DATA_PORT);
    // const mapDataClient = new AutoReconnectTCPClient(serverIp, AgentsCommService.MAP_DATA_PORT);
    // const controlCmdClient = new AutoReconnectTCPClient(serverIp, AgentsCommService.CONTROL_CMD_PORT);
    // const navigationCmdClient = new AutoReconnectTCPClient(serverIp, AgentsCommService.NAVIGATION_CMD_PORT);

    const portStatus = {
      data: false,
      map: false,
      control: false,
      navigation: false
    };

    generalTcpClient.on('connect', () => {
      // console.log('connected to general tcp client');
      portStatus.data = true;
      this.eventEmitter.emit('statusData', agentId, { status: 'idle' });
    });

    generalTcpClient.on('close', () => {
      portStatus.data = false;
      this.eventEmitter.emit('statusData', agentId, { status: 'offline' });
    });

    let receivedBuf = Buffer.alloc(0);
    let expectedLength = 0;

    generalTcpClient.on('data', (chunk) => {
      // console.log('before', receivedBuf);
      receivedBuf = Buffer.concat([receivedBuf, chunk]);
      // console.log('recv', chunk);
      // console.log('after', receivedBuf);

      if (expectedLength === 0) {
        if (receivedBuf.length >= 6 && receivedBuf.subarray(0, 2).toString('hex') === 'fe01') {
          expectedLength = receivedBuf.readUInt32BE(2);
          receivedBuf = receivedBuf.subarray(6);
        }
      }

      // If we have enough data for the full message
      if (expectedLength > 0 && receivedBuf.length >= expectedLength) {
        const rawMsg = receivedBuf.subarray(0, expectedLength).toString('utf-8');
        
        try {
          const data = JSON.parse(rawMsg.toString());

          this.eventEmitter.emit('statusData', agentId, {
            linearVelo: data?.velocity?.linear?.x ?? 0,
            angularVelo: data?.velocity?.angular?.z ?? 0,
            heading: data?.pose?.orientation
              ? quaternionToYaw(data.pose.orientation)
              : 0,
            position: data?.pose?.position
              ? [data.pose.position.x, data.pose.position.y]
              : null
          });

          // only if map data is available
          if (data.map?.data?.length) {
            const mapData: MapData = fixMapRotation({
              width: data.map.width,
              height: data.map.height,
              resolution: data.map.resolution,
              origin: [data.map.origin.position.x, data.map.origin.position.y, data.map.origin.position.z],
              mapMatrix: convert1DTo2DMap(data.map.data, data.map.width, data.map.height)
            });

            this.eventEmitter.emit('mapData', agentId, mapData);
          }
        } catch (error) {
          console.log('Error receiving status data', error);
        }

        receivedBuf = receivedBuf.subarray(expectedLength); // Remove the processed message
        expectedLength = 0;
      }
    });

    this.eventEmitter.on('controlCmd', (cmdAgentId: number, linearX: number, angularZ: number) => {
      if (agentId !== cmdAgentId) return;
      const controlData = { command: 'keyboard', linear_x: linearX, angular_z: angularZ };
      generalTcpClient.write(JSON.stringify(controlData));
    });

    this.eventEmitter.on('navigationCmd', (cmdAgentId: number, navigationStr: string) => {
      if (agentId !== cmdAgentId) return;
      const navs = navigationStr.split(',');
      const navData = {
        command: 'coordinate',
        coordinate_x: parseFloat(navs[0]),
        coordinate_y: parseFloat(navs[1]),
        heading: navs[2] ? parseFloat(navs[2]) : 0
      };
      generalTcpClient.write(JSON.stringify(navData));
    });

    // let recvMapDataQueue = Buffer.alloc(0);
    // let prevFullMapData = Buffer.alloc(0);

    // mapDataClient.on('data', (rawData) => {
    //   recvMapDataQueue = Buffer.concat([recvMapDataQueue, rawData]);

    //   if (
    //     recvMapDataQueue.toString('utf8').startsWith('<<<') &&
    //     recvMapDataQueue.toString('utf8').endsWith('>>>')
    //   ) {
    //     try {
    //       let fullMapData = recvMapDataQueue.subarray(3, -3);
    //       // console.log('Received map', fullMapData.length);
    //       if (fullMapData.toString('utf8').startsWith('BSDIFF40')) {
    //         fullMapData = patch(prevFullMapData, fullMapData);
    //       }
          
    //       const parsedMapData = JSON.parse(fullMapData.toString('utf8'));
    //       this.eventEmitter.emit('mapData', agentId, parsedMapData);
          
    //       recvMapDataQueue = Buffer.alloc(0);
    //       prevFullMapData = fullMapData;
    //     } catch (error) {
    //       console.log('Error patching map data');
    //     }
    //   }
    // });
  }
}

function quaternionToYaw({ x, y, z, w }: Quaternion) {
  const yawInRadians = Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z));
  const yawInDegrees = yawInRadians * (180 / Math.PI);
  return yawInDegrees;
}

export default AgentsCommService;
