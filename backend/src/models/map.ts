export type Coordinate3D = [x: number, y: number, z: number];

export interface MapData {
  type?: 'static' | 'globalCostmap' | 'localCostmap';
  width: number;
  height: number;
  resolution?: number;
  origin?: Coordinate3D;
  mapMatrix: number[][];
}

export interface MapDataPNG extends Omit<MapData, 'mapMatrix'> {
  base64: string; // base64 png
}
