import { EventEmitter } from 'events';
import zlib from 'zlib';
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

  static MSG_HEAD = 'R';

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
        if (receivedBuf.length >= 6 && receivedBuf[0] === AgentsCommService.MSG_HEAD.charCodeAt(0)) {
          expectedLength = receivedBuf.readUintBE(2, 3);
          // remove msg header and checksum
          receivedBuf = receivedBuf.subarray(5, -2);
        }
      }

      // If we have enough data for the full message
      if (expectedLength > 0 && receivedBuf.length >= expectedLength) {
        try {
          const rawMsg = zlib.inflateSync(receivedBuf).toString('utf-8');
          const msg = JSON.parse(rawMsg.toString());
          const msgPayload = msg.payload;
          // console.log(msgPayload);
          // console.log(zlib.inflateSync(receivedBuf).length, 'down to', receivedBuf.length)

          this.eventEmitter.emit('statusData', agentId, {
            linearVelo: msgPayload?.velocity?.linear?.x ?? 0,
            angularVelo: msgPayload?.velocity?.angular?.z ?? 0,
            heading: msgPayload?.pose?.orientation
              ? quaternionToYaw(msgPayload.pose.orientation)
              : 0,
            position: msgPayload?.pose?.position
              ? [msgPayload.pose.position.x, msgPayload.pose.position.y]
              : null
          });

          // only if map data is available
          if (msgPayload.map?.data?.length) {
            const msgMap = msgPayload.map;
            const msgMapOrigPos = msgMap.origin.position;
            const mapData: MapData = fixMapRotation({
              width: msgMap.width,
              height: msgMap.height,
              resolution: msgMap.resolution,
              origin: [msgMapOrigPos.x, msgMapOrigPos.y, msgMapOrigPos.z],
              mapMatrix: convert1DTo2DMap(msgMap.data, msgMap.width, msgMap.height)
            });

            this.eventEmitter.emit('mapData', agentId, mapData);
          }

          if (msgPayload.global_costmap?.data?.length) {
            const msgGcmap = msgPayload.global_costmap;
            const msgGcmapOrigPos = msgGcmap.info.origin.position;
            const mapData: MapData = fixMapRotation({
              type: 'globalCostmap',
              width: msgGcmap.info.width,
              height: msgGcmap.info.height,
              resolution: msgGcmap.info.resolution,
              origin: [msgGcmapOrigPos.x, msgGcmapOrigPos.y, msgGcmapOrigPos.z],
              mapMatrix: convert1DTo2DMap(msgGcmap.data, msgGcmap.info.width, msgGcmap.info.height)
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
      const controlData = {
        type: 'command_control',
        payload: {
          linear_x: linearX,
          angular_z: angularZ
        }
      };
      const buffToSend = packMessage(JSON.stringify(controlData));
      generalTcpClient.write(buffToSend);
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

function packMessage(payload: string): Buffer {
  const HEAD = 'R\x01';
  const compressedPayload = zlib.deflateSync(payload);
  const length = Buffer.alloc(3);
  length.writeUIntBE(compressedPayload.length, 0, 3);
  const packet = Buffer.concat([Buffer.from(HEAD), length, compressedPayload]);
  return packet
}

export default AgentsCommService;
