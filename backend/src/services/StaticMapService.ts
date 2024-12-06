import fs from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';
import { PNG } from 'pngjs';
import yaml from 'js-yaml';

type Coordinate3D = [x: number, y: number, z: number];

interface MapData {
  width: number;
  height: number;
  resolution: number;
  origin: Coordinate3D;
  content: string; // base64 png
}

interface MapDataMatrix {
  width: number;
  height: number;
  map_matrix: number[][];
}

class StaticMapService {
  public mapName: string;
  public isMapLoaded: boolean;
  private mapData: MapData | null;

  constructor(mapName: string) {
    this.mapName = mapName;
    this.isMapLoaded = false;
    this.mapData = null;
  }

  public getMap(): MapData | null {
    return this.isMapLoaded ? this.mapData : null;
  }

  public async loadMap() {
    const mapDirectory = `./maps/${this.mapName}`;
    if (!fs.existsSync(mapDirectory)) {
      console.error('StaticMap: Error reading map: Map directory not found');
      return;
    }

    const pngFilePath = path.join(mapDirectory, 'map.png');
    if (!fs.existsSync(pngFilePath)) {
      // generate png from pgm
      await this.convertMapPgmToPng(path.join(mapDirectory, 'map.pgm'));
    }

    // default res & origin values if metadata file not exists
    let mapResolution = 0.1;
    let mapOrigin: Coordinate3D = [0, 0, 0];

    const yamlFilePath = path.join(mapDirectory, 'map.yaml');
    if (fs.existsSync(yamlFilePath)) {
      const yamlFileContent = await readFile(yamlFilePath, 'utf-8');
      const mapMetadata: any = yaml.load(yamlFileContent);
      
      if (mapMetadata.resolution) mapResolution = mapMetadata.resolution;
      if (mapMetadata.origin) mapOrigin = mapMetadata.origin;
    }
    
    try {
      const pngFileBuffer = await readFile(pngFilePath);
      const pngFile = await new Promise<PNG>((resolve, reject) => {
        new PNG().parse(pngFileBuffer, (error, data) => {
          if (error) {
            reject(error);
          } else {
            resolve(data);
          }
        });
      });

      this.isMapLoaded = true;
      this.mapData = {
        width: pngFile.height,
        height: pngFile.width,
        resolution: mapResolution,
        origin: mapOrigin,
        content: pngFileBuffer.toString('base64')
      };

      console.log('StaticMap: Successfully loaded map ' + this.mapName);
    } catch (error) {
      console.error('StaticMap: Error reading png file:', error)
    }
  }

  private async convertMapPgmToPng(filePath: string) {
    const pgmContent = await readFile(filePath);
    
    const magicNumEndIdx = pgmContent.indexOf('\n');
    const magicNumber = pgmContent.subarray(0, magicNumEndIdx).toString();
    if (magicNumber !== 'P5') {
      console.error('StaticMap: Error reading map: Not a pgm file');
      return;
    }
  
    const dimsEndIdx = pgmContent.indexOf('\n', magicNumEndIdx+1);
    const dims = pgmContent.subarray(magicNumEndIdx+1, dimsEndIdx).toString();
    const [width, height] = dims.split(' ').map((d) => parseInt(d));
  
    const maxValEndIdx = pgmContent.indexOf('\n', dimsEndIdx+1);
    const maxValStr = pgmContent.subarray(dimsEndIdx+1, maxValEndIdx).toString();
    const maxVal = parseInt(maxValStr);
    
    // convert buffer to array of integers
    const pixels1D = [...pgmContent.subarray(maxValEndIdx+1)];
    let mapData = {
      width: width,
      height: height,
      map_matrix: convert1DTo2DMap(pixels1D, width, height)
    };
    mapData = fixMapRotation(mapData);
    const pixels = mapData.map_matrix;
    
    const pngFile = new PNG({
      width: mapData.width,
      height: mapData.height
    });
    const outFilePath = filePath.replace('.pgm', '.png');
  
    for (let y = 0; y < pngFile.height; y++) {
      for (let x = 0; x < pngFile.width; x++) {
        const idx = (pngFile.width * y + x)
        const pngIdx = idx << 2
        let pixel = pixels[y][x] / maxVal * 255
        if (pixels[y][x] === -1) pixel = 0
  
        pngFile.data[pngIdx] = Math.min(pixel, 255)
        pngFile.data[pngIdx + 1] = Math.min(pixel, 255)
        pngFile.data[pngIdx + 2] = Math.min(pixel, 255)
        pngFile.data[pngIdx + 3] = pixels[y][x] >= 0 ? 0xff : 0x00
      }
    }

    try {
      await new Promise<void>((resolve, reject) => {
        pngFile.pack().pipe(fs.createWriteStream(outFilePath))
          .on('finish', resolve)
          .on('error', reject)
      });
      console.log('StaticMap: Successfully generating png');
    } catch (error) {
      console.error('StaticMap: Error when converting pgm to png:', error)
    }
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
function fixMapRotation(mapData: MapDataMatrix): MapDataMatrix {
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
    map_matrix: rotatedMatrix
  };
}

export default StaticMapService;
export { MapData };
