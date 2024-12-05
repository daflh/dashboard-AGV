import { EventEmitter } from 'events';
import AutoReconnectTCPClient from './AutoReconnectTCPClient';
import { AgentConfiguration } from '../models/agent';
// @ts-ignore
import { Bzip2 } from 'compressjs';

interface MapData {
  width: number;
  height: number;
  resolution: number;
  origin: number[];
  map_matrix: number[][];
}

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

  public onMapData(callback: (agentId: number, data: object) => void) {
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
            linearVelo: data?.cmd_vel?.linear?.x ?? 0,
            angularVelo: data?.cmd_vel?.angular?.z ?? 0,
            heading: data?.position_robot?.pose?.orientation
              ? quaternionToYaw(
                data.position_robot.pose.orientation.x,
                data.position_robot.pose.orientation.y,
                data.position_robot.pose.orientation.z,
                data.position_robot.pose.orientation.w)
              : 0,
            position: data?.position_robot?.pose?.position
              ? [data.position_robot.pose.position.x, data.position_robot.pose.position.y]
              : null
          });

          // only if map data is available
          if (data.map?.data?.length) {
            let mapData = {
              width: data.map.info.width,
              height: data.map.info.height,
              resolution: data.map.info.resolution,
              origin: data.map.info.origin,
              map_matrix: convert1DTo2DMap(data.map.data, data.map.info.width, data.map.info.height)
            };
            mapData = fixMapRotation(mapData);
            
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

function convert1DTo2DMap(array: number[], width: number, height: number) {
  if (array.length !== width * height) {
    throw new Error("The array size does not match the specified dimensions.");
  }

  const mapMatrix = [];
  for (let y = 0; y < height; y++) {
    const row = array.slice(y * width, (y + 1) * width);
    mapMatrix.push(row);
  }
  return mapMatrix;
}

// Rotate map 90 degrees CCW and mirror horizontally for display
function fixMapRotation(mapData: MapData): MapData {
  const matrix = mapData.map_matrix;
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rotatedMatrix = Array.from({ length: cols }, () => Array(rows));

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      rotatedMatrix[cols - x - 1][rows - y - 1] = matrix[y][x];
    }
  }

  return {
    width: mapData.height,
    height: mapData.width,
    resolution: mapData.resolution,
    origin: mapData.origin,
    map_matrix: rotatedMatrix
  };
}

function quaternionToYaw(x: number, y: number, z: number, w: number) {
  const yawInRadians = Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z));
  const yawInDegrees = yawInRadians * (180 / Math.PI);
  return yawInDegrees;
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
