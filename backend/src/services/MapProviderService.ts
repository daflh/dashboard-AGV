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

class MapProviderService {
  private mapName: string;
  private isMapLoaded: boolean;
  private mapData: MapData | null;

  constructor(mapName: string) {
    this.mapName = mapName;
    this.isMapLoaded = false;
    this.mapData = null;

    this.loadMap();
  }

  public getMap(): MapData | null {
    return this.isMapLoaded ? this.mapData : null;
  }

  private async loadMap() {
    const mapDirectory = `./maps/${this.mapName}`;
    if (!fs.existsSync(mapDirectory)) {
      console.error('MapProvider: Error reading map: Map directory not found');
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
        width: pngFile.width,
        height: pngFile.height,
        resolution: mapResolution,
        origin: mapOrigin,
        content: pngFileBuffer.toString('base64')
      };

      console.log('MapProvider: Successfully loaded map ' + this.mapName);
    } catch (error) {
      console.error('MapProvider: Error reading png file:', error)
    }
  }

  private async convertMapPgmToPng(filePath: string) {
    const pgmContent = await readFile(filePath);
    
    const magicNumEndIdx = pgmContent.indexOf('\n');
    const magicNumber = pgmContent.subarray(0, magicNumEndIdx).toString();
    if (magicNumber !== 'P5') {
      console.error('MapProvider: Error reading map: Not a pgm file');
      return;
    }
  
    const dimsEndIdx = pgmContent.indexOf('\n', magicNumEndIdx+1);
    const dims = pgmContent.subarray(magicNumEndIdx+1, dimsEndIdx).toString();
    const [width, height] = dims.split(' ').map((d) => parseInt(d));
  
    const maxValEndIdx = pgmContent.indexOf('\n', dimsEndIdx+1);
    const maxValStr = pgmContent.subarray(dimsEndIdx+1, maxValEndIdx).toString();
    const maxVal = parseInt(maxValStr);
    
    // convert buffer to array of integers
    const pixels = [...pgmContent.subarray(maxValEndIdx+1)];
    
    const pngFile = new PNG({ width, height });
    const outFilePath = filePath.replace('.pgm', '.png');
  
    for (let y = 0; y < pngFile.height; y++) {
      for (let x = 0; x < pngFile.width; x++) {
        const idx = (pngFile.width * y + x)
        const pngIdx = idx << 2
        const pixel = pixels[idx] / maxVal * 255
  
        pngFile.data[pngIdx] = Math.min(pixel, 255)
        pngFile.data[pngIdx + 1] = Math.min(pixel, 255)
        pngFile.data[pngIdx + 2] = Math.min(pixel, 255)
        pngFile.data[pngIdx + 3] = 0xff
      }
    }

    try {
      await new Promise<void>((resolve, reject) => {
        pngFile.pack().pipe(fs.createWriteStream(outFilePath))
          .on('finish', resolve)
          .on('error', reject)
      });
      console.log('MapProvider: Successfully generating png');
    } catch (error) {
      console.error('MapProvider: Error when converting pgm to png:', error)
    }
  }
}

export default MapProviderService;
export { MapData };
