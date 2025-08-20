import { createHash } from 'crypto';

// Sniff the MIME type and file extension based on the first few bytes of a Buffer.
export function sniffMimeAndExt(buf: Buffer): { mime: string; ext: string | null } {
  // JPEG: FF D8 FF
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { mime: 'image/jpeg', ext: 'jpg' };
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return { mime: 'image/png', ext: 'png' };
  }
  // GIF87a / GIF89a
  if (
    buf.length >= 6 &&
    buf[0] === 0x47 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x38 &&
    (buf[4] === 0x37 || buf[4] === 0x39) &&
    buf[5] === 0x61
  ) {
    return { mime: 'image/gif', ext: 'gif' };
  }
  // PDF: 25 50 44 46 2D  ( %PDF- )
  if (
    buf.length >= 5 &&
    buf[0] === 0x25 &&
    buf[1] === 0x50 &&
    buf[2] === 0x44 &&
    buf[3] === 0x46 &&
    buf[4] === 0x2d
  ) {
    return { mime: 'application/pdf', ext: 'pdf' };
  }
  // ZIP (and by extension DOCX/XLSX/PPTX): 50 4B 03 04
  if (buf.length >= 4 && buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04) {
    return { mime: 'application/zip', ext: 'zip' };
  }
  // Plain text heuristic: if mostly printable ASCII in first 32 bytes
  const sample = buf.subarray(0, Math.min(32, buf.length));
  const printable = [...sample].filter((b) => (b >= 9 && b <= 13) || (b >= 32 && b <= 126)).length;
  if (sample.length > 0 && printable / sample.length > 0.85) {
    return { mime: 'text/plain', ext: 'txt' };
  }

  // Fallback
  return { mime: 'application/octet-stream', ext: null };
}

// Generate a SHA-256 hex checksum for a Buffer.
export function sha256Hex(buf: Buffer): string {
  const h = createHash('sha256');
  h.update(buf);
  return h.digest('hex');
}
