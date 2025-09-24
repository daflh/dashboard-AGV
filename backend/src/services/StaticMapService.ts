import fs from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { convert1DTo2DMap, fixMapRotation, convertMapToPng } from '../utils/mapUtils';
import { MapDataPNG, Coordinate3D } from '../models/map';

class StaticMapService {
  public mapName: string;
  public isMapLoaded: boolean;
  private mapData: MapDataPNG | null;

  constructor() {
    this.mapName = ''; // Default kosong, akan diatur melalui setMapName()
    this.isMapLoaded = false;
    this.mapData = null;
  }
  
  public setMapName(mapName: string) {
    this.mapName = mapName;
    this.isMapLoaded = false; // Reset status agar map baru dimuat
  }

  public getMap(): MapDataPNG | null {
    return this.isMapLoaded ? this.mapData : null;
  }

  public getAvailableMaps() {
    const mapsDir = './maps';
    if (!fs.existsSync(mapsDir)) {
      console.error('StaticMap: Error reading map: Map directory not found');
      return [];
    }

    const mapNames = fs.readdirSync(mapsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    return mapNames;
  }

  public async loadMap() {
    if (!this.mapName) {
      console.error('StaticMap: Map name not provided');
      return;
    }

    const mapDirectory = `./maps/${this.mapName}`;
    if (!fs.existsSync(mapDirectory)) {
      console.error('StaticMap: Error reading map: Map directory not found');
      return;
    }

    const pgmFilePath = path.join(mapDirectory, 'map.pgm');
    if (!fs.existsSync(pgmFilePath)) {
      console.error('StaticMap: Error reading map: PGM file not found');
      return;
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

    const pgmBuffer = await readFile(pgmFilePath);
    const pngMapData = await this.convertMapPgmToPng(pgmBuffer);

    if (!pngMapData) return;

    this.isMapLoaded = true;
    this.mapData = {
      width: pngMapData.width,
      height: pngMapData.height,
      resolution: mapResolution,
      origin: mapOrigin,
      base64: pngMapData.base64
    };
    
    console.log('StaticMap: Successfully loaded map ' + this.mapName);
  }

  private async convertMapPgmToPng(pgmBuf: Buffer) {
    const magicNumEndIdx = pgmBuf.indexOf('\n');
    const magicNumber = pgmBuf.subarray(0, magicNumEndIdx).toString();
    if (magicNumber !== 'P5') {
      console.error('StaticMap: Error reading map: Not a pgm file');
      return;
    }
  
    const dimsEndIdx = pgmBuf.indexOf('\n', magicNumEndIdx+1);
    const dims = pgmBuf.subarray(magicNumEndIdx+1, dimsEndIdx).toString();
    const [width, height] = dims.split(' ').map((d) => parseInt(d));
  
    const maxValEndIdx = pgmBuf.indexOf('\n', dimsEndIdx+1);
    const maxValStr = pgmBuf.subarray(dimsEndIdx+1, maxValEndIdx).toString();
    const maxVal = parseInt(maxValStr);
    
    // convert buffer to array of integers
    const pixels1D = [...pgmBuf.subarray(maxValEndIdx+1)];
    const mapData = fixMapRotation({
      width: width,
      height: height,
      mapMatrix: convert1DTo2DMap(pixels1D, width, height)
    }, false);

    try {
      const mapDataPng = await convertMapToPng(mapData, maxVal);
      return mapDataPng;
    } catch (error) {
      console.error('StaticMap: Error when converting pgm to png:', error);
      return;
    }
  }
}

export default StaticMapService;
