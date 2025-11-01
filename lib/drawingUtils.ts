import LZString from 'lz-string';
import type { TLStoreSnapshot } from 'tldraw';

/**
 * Compress drawing data using LZ-string compression
 * Typically reduces size by 60-80%
 */
export function compressDrawing(snapshot: TLStoreSnapshot): string {
  const json = JSON.stringify(snapshot);
  return LZString.compressToUTF16(json);
}

/**
 * Decompress drawing data from LZ-string format
 * Throws error if decompression fails
 */
export function decompressDrawing(data: string): TLStoreSnapshot {
  const json = LZString.decompressFromUTF16(data);
  if (!json) {
    throw new Error('Failed to decompress drawing data');
  }
  return JSON.parse(json);
}

/**
 * Get the size of compressed drawing data in bytes
 */
export function getDrawingSize(data: string): number {
  return new Blob([data]).size;
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
