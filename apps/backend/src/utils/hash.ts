import { createHash } from 'node:crypto';

// Generate a SHA-256 hash of the input data and return it as a hexadecimal string.
export function sha256Hex(data: Buffer | Uint8Array): string {
  const hash = createHash('sha256');
  hash.update(data);
  return hash.digest('hex'); // e.g. "4f8b42c2..."
}
