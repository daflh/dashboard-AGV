export type Coordinate3D = [x: number, y: number, z: number];

export interface MapData {
  width: number;
  height: number;
  resolution?: number;
  origin?: Coordinate3D;
  mapMatrix: number[][];
}

export interface MapDataPNG {
  width: number;
  height: number;
  resolution?: number;
  origin?: Coordinate3D;
  base64: string; // base64 png
}
