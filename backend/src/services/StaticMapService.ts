import fs from 'fs';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { PNG } from 'pngjs';
import yaml from 'js-yaml';
import { convert1DTo2DMap, fixMapRotation, convertMapToPng } from '../utils/mapUtils';
import { MapDataPNG, Coordinate3D } from '../models/map';

class StaticMapService {
  public mapName: string;
  public isMapLoaded: boolean;
  private mapData: MapDataPNG | null;

  constructor(mapName: string) {
    this.mapName = mapName;
    this.isMapLoaded = false;
    this.mapData = null;
  }

  public getMap(): MapDataPNG | null {
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
        width: pngFile.width,
        height: pngFile.height,
        resolution: mapResolution,
        origin: mapOrigin,
        base64: pngFileBuffer.toString('base64')
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
    const outFilePath = filePath.replace('.pgm', '.png');
    const mapData = fixMapRotation({
      width: width,
      height: height,
      mapMatrix: convert1DTo2DMap(pixels1D, width, height)
    }, false);

    try {
      const mapDataPng = await convertMapToPng(mapData, maxVal);
      await writeFile(outFilePath, mapDataPng.base64, 'base64');

      console.log('StaticMap: Successfully generating png');
    } catch (error) {
      console.error('StaticMap: Error when converting pgm to png:', error)
    }
  }
}

export default StaticMapService;
