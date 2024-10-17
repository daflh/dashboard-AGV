import { EventEmitter } from 'events';
import AutoReconnectTCPClient from './AutoReconnectTCPClient';
import { AgentConfiguration } from '../models/agent';
// @ts-ignore
import { Bzip2 } from 'compressjs';

class AgentsCommService {
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

  public onMapData(callback: (agentId: number, data: object) => void) {
    this.eventEmitter.on('mapData', callback);
  }

  public sendControlCmd(agentId: number, linearX: number, angularZ: number) {
    this.eventEmitter.emit('controlCmd', agentId, linearX, angularZ);
  }

  public sendNavigationCmd(agentId: number, positionStr: string) {
    this.eventEmitter.emit('navigationCmd', agentId, positionStr);
  }

  private startCommClient(agentId: number, serverIp: string) {
    const statusDataClient = new AutoReconnectTCPClient(serverIp, AgentsCommService.STATUS_DATA_PORT);
    const mapDataClient = new AutoReconnectTCPClient(serverIp, AgentsCommService.MAP_DATA_PORT);
    const controlCmdClient = new AutoReconnectTCPClient(serverIp, AgentsCommService.CONTROL_CMD_PORT);
    const navigationCmdClient = new AutoReconnectTCPClient(serverIp, AgentsCommService.NAVIGATION_CMD_PORT);

    const portStatus = {
      data: false,
      map: false,
      control: false,
      navigation: false
    };


    statusDataClient.on('connect', () => {
      portStatus.data=true;
      this.eventEmitter.emit('statusData', agentId, { status: 'idle' });
    });

    statusDataClient.on('close', () => {
      portStatus.data=false;
      this.eventEmitter.emit('statusData', agentId, { status: 'offline' });
    });

    mapDataClient.on('connect', () => {
      portStatus.map = true;
      this.eventEmitter.emit('statusData', agentId, { portStatus });
    });
  
    mapDataClient.on('close', () => {
      portStatus.map = false;
      this.eventEmitter.emit('statusData', agentId, { portStatus });
    });

    controlCmdClient.on('connect', () => {
      portStatus.control = true;
      this.eventEmitter.emit('statusData', agentId, { portStatus });
    });
  
    controlCmdClient.on('close', () => {
      portStatus.control = false;
      this.eventEmitter.emit('statusData', agentId, { portStatus });
    });
  
    navigationCmdClient.on('connect', () => {
      portStatus.navigation = true;
      this.eventEmitter.emit('statusData', agentId, { portStatus });
    });
  
    navigationCmdClient.on('close', () => {
      portStatus.navigation = false;
      this.eventEmitter.emit('statusData', agentId, { portStatus });
    });

    
    statusDataClient.on('data', (rawData) => {
      try {
        const data = JSON.parse(rawData.toString());
        this.eventEmitter.emit('statusData', agentId, {
          linearVelo: data?.cmd_vel?.linear?.x ?? 0,
          angularVelo: data?.cmd_vel?.angular?.z ?? 0,
          position: data?.odom?.position ? [data.odom.position.x, data.odom.position.y] : null
        });
      } catch (error) {
        console.log('Error receiving status data');
      }
    });

    let recvMapDataQueue = Buffer.alloc(0);
    let prevFullMapData = Buffer.alloc(0);

    mapDataClient.on('data', (rawData) => {
      recvMapDataQueue = Buffer.concat([recvMapDataQueue, rawData]);

      if (
        recvMapDataQueue.toString('utf8').startsWith('<<<') &&
        recvMapDataQueue.toString('utf8').endsWith('>>>')
      ) {
        try {
          let fullMapData = recvMapDataQueue.subarray(3, -3);
          // console.log('Received map', fullMapData.length);
          if (fullMapData.toString('utf8').startsWith('BSDIFF40')) {
            fullMapData = patch(prevFullMapData, fullMapData);
          }
          
          const parsedMapData = JSON.parse(fullMapData.toString('utf8'));
          this.eventEmitter.emit('mapData', agentId, parsedMapData);
          
          recvMapDataQueue = Buffer.alloc(0);
          prevFullMapData = fullMapData;
        } catch (error) {
          console.log('Error patching map data');
        }
      }
    });

    this.eventEmitter.on('controlCmd', (cmdAgentId: number, linearX: number, angularZ: number) => {
      if (agentId !== cmdAgentId) return;
      const controlData = { linear_x: linearX, angular_z: angularZ };
      controlCmdClient.write(JSON.stringify(controlData) + ';$');
    });

    this.eventEmitter.on('navigationCmd', (cmdAgentId: number, positionStr: string) => {
      if (agentId !== cmdAgentId) return;
      // const [x, y] = position;
      navigationCmdClient.write(`${positionStr}\n`);
    });
  }
}

// Function to apply the patch (BSDIFF4 format)
function patch(srcBytes: Buffer, patchBytes: Buffer) {
  const [lenDst, controlTuples, diffBlock, extraBlock] = parsePatchBfr(patchBytes) as [number, any[], Buffer, Buffer];

  // Allocate buffer for the new data
  const newData = Buffer.alloc(lenDst);

  let oldPos = 0;
  let newPos = 0;
  let diffPtr = 0;
  let extraPtr = 0;

  for (const [x, y, z] of controlTuples) {
      // Apply the diff block
      for (let i = 0; i < x; i++) {
          newData[newPos + i] = (srcBytes[oldPos + i] + diffBlock[diffPtr + i]) % 256;
      }
      diffPtr += x;
      newPos += x;
      oldPos += x;

      // Copy the extra block
      for (let i = 0; i < y; i++) {
          newData[newPos + i] = extraBlock[extraPtr + i];
      }
      extraPtr += y;
      newPos += y;

      // Adjust oldPos for the next diff block
      oldPos += z;
  }

  return newData;
}

function parsePatchBfr(buffer: Buffer, headerOnly: boolean = false) {
  const MAGIC = 'BSDIFF40';
  let offset = 0;

  // Check the magic header
  const magic = buffer.slice(offset, offset + 8);
  offset += 8;
  if (!magic.equals(Buffer.from(MAGIC))) {
      throw new Error("Incorrect BSDIFF4 header");
  }

  // Read length headers
  const lenControl = decodeInt64(buffer.slice(offset, offset + 8));
  offset += 8;
  const lenDiff = decodeInt64(buffer.slice(offset, offset + 8));
  offset += 8;
  const lenDst = decodeInt64(buffer.slice(offset, offset + 8));
  offset += 8;

  // Read and decompress the control header
  const bcontrol = Buffer.from(Bzip2.decompressFile(buffer.slice(offset, offset + lenControl)));
  offset += lenControl;
  
  const controlTuples = [];
  for (let i = 0; i < bcontrol.length; i += 24) {
      const x = decodeInt64(bcontrol.slice(i, i + 8));
      const y = decodeInt64(bcontrol.slice(i + 8, i + 16));
      const z = decodeInt64(bcontrol.slice(i + 16, i + 24));
      controlTuples.push([x, y, z]);
  }

  if (headerOnly) {
      return [lenControl, lenDiff, lenDst, controlTuples];
  }

  // Read and decompress the diff and extra blocks
  const bdiff = Buffer.from(Bzip2.decompressFile(buffer.slice(offset, offset + lenDiff)));
  offset += lenDiff;
  const bextra = Buffer.from(Bzip2.decompressFile(buffer.slice(offset)));

  return [lenDst, controlTuples, bdiff, bextra];
}

// Function to decode a 64-bit integer from an 8-byte buffer
function decodeInt64(buffer: Buffer) {
  if (!(buffer instanceof Buffer) || buffer.length !== 8) {
      throw new TypeError("Expected 8-byte buffer");
  }

  let x = buffer[7] & 0x7f;  // Get the most significant byte, masking the sign bit
  for (let i = 6; i >= 0; i--) {
      x = (x << 8) | buffer[i];  // Shift left and OR with the next byte
  }

  // Check if the sign bit is set (negative number)
  if (buffer[7] & 0x80) {
      x = -x;
  }

  return x;
}

export default AgentsCommService;
