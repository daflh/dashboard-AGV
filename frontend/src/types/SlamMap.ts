export default interface SlamMap {
  width: number;
  height: number;
  resolution: number;
  origin: [x: number, y: number, z: number];
  content: string; // base64 png
}
