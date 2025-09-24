// @ts-ignore
import { Bzip2 } from 'compressjs';

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

// Function to apply the patch (BSDIFF4 format)
export function patch(srcBytes: Buffer, patchBytes: Buffer) {
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
