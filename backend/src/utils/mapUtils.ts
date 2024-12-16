import { PNG } from 'pngjs';
import { MapData, MapDataPNG } from "../models/map";

export function convert1DTo2DMap(array: number[], width: number, height: number) {
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

// Rotate map 90 degrees CCW and mirror horizontally (optional) for display
export function fixMapRotation(mapData: MapData, mirror = true): MapData {
  const matrix = mapData.mapMatrix;
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rotatedMatrix = Array.from({ length: cols }, () => Array(rows));

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const secondArrIndex = mirror ? rows-y-1 : y;
      rotatedMatrix[cols - x - 1][secondArrIndex] = matrix[y][x];
    }
  }

  return {
    width: mapData.height,
    height: mapData.width,
    resolution: mapData.resolution,
    origin: mapData.origin,
    mapMatrix: rotatedMatrix
  };
}

export async function convertMapToPng(
  mapData: MapData, maxVal = 255, isValInverted = false
): Promise<MapDataPNG> {
  const pixels = mapData.mapMatrix;
  const pngFile = new PNG({
    width: mapData.width,
    height: mapData.height
  });

  for (let y = 0; y < pngFile.height; y++) {
    for (let x = 0; x < pngFile.width; x++) {
      const idx = (pngFile.width * y + x)
      const pngIdx = idx << 2
      let pixel = pixels[y][x] / maxVal * 255
      if (isValInverted) pixel = 255 - pixel
      if (pixels[y][x] === -1) pixel = 0

      pngFile.data[pngIdx] = Math.min(pixel, 255)
      pngFile.data[pngIdx + 1] = Math.min(pixel, 255)
      pngFile.data[pngIdx + 2] = Math.min(pixel, 255)
      pngFile.data[pngIdx + 3] = pixels[y][x] >= 0 ? 0xff : 0x00
    }
  }

  const chunks: any[] = [];
  const pngBase64 = await new Promise<string>((resolve) => {
    pngFile.pack();
    pngFile.on('data', (chunk) => {
      chunks.push(chunk);
    });
    pngFile.on('end', () => {
      resolve(Buffer.concat(chunks).toString('base64'))
    });
  });

  return {
    width: mapData.width,
    height: mapData.height,
    resolution: mapData.resolution,
    origin: mapData.origin,
    base64: pngBase64
  };
}
