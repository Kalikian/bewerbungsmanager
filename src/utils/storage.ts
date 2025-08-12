import path from 'node:path';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';

// Define the root directory for file storage
const STORAGE_ROOT = process.env.FILES_DIR
  ? path.resolve(process.env.FILES_DIR)
  : path.resolve('uploads');

// Ensure the storage directory exists at module load
if (!existsSync(STORAGE_ROOT)) {
  await fs.mkdir(STORAGE_ROOT, { recursive: true });
}

// Build a storage key based on the checksum and optional file extension.
export function buildStorageKey(checksumHex: string, ext: string | null): string {
  return ext ? `${checksumHex}.${ext}` : `${checksumHex}.bin`;
}

// Get the absolute path for a storage key, ensuring it is within the STORAGE_ROOT.
export function storagePath(storageKey: string): string {
  return path.join(STORAGE_ROOT, storageKey);
}

// Write a file atomically to the storage path, creating directories as needed.
export async function writeFileAtomic(absPath: string, content: Buffer) {
  await fs.mkdir(path.dirname(absPath), { recursive: true }); // make folder if missing
  await fs.writeFile(absPath, content);
}
