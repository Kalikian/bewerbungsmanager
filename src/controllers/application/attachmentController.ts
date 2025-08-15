import type { Express, Request, Response, NextFunction } from 'express';

// Zod schemas
import {
  attachmentApplicationIdParamSchema,
  attachmentIdParamSchema,
  listAttachmentQuerySchema,
} from '../../validation/application/attachmentSchema.js';

import * as attachmentModel from '../../models/application/attachmentModel.js';
import * as fileSniff from '../../utils/fileSniff.js';
import * as hash from '../../utils/hash.js';
import * as storage from '../../utils/storage.js';

export async function uploadAttachment(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { applicationId } = attachmentApplicationIdParamSchema.parse(req.params);

    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file || !file.buffer || file.size === 0) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Server-side hash and MIME sniff
    const checksum = hash.sha256Hex(file.buffer);
    const { mime, ext } = fileSniff.sniffMimeAndExt(file.buffer);

    // Check if a physical file already exists for this checksum
    let storageKey = await attachmentModel.findReusableStorageKeyByChecksum(checksum);
    if (!storageKey) {
      storageKey = storage.buildStorageKey(checksum, ext);
      const abs = storage.storagePath(storageKey);
      await storage.writeFileAtomic(abs, file.buffer);
    }

    // Insert DB row (ownership is validated in SQL)
    const inserted = await attachmentModel.insertAttachment({
      applicationId,
      userId,
      filenameOriginal: file.originalname,
      mimeType: mime,
      sizeBytes: file.size,
      storageKey,
      checksumSha256: checksum,
    });

    if (!inserted) {
      return res.status(404).json({ error: 'Application not found or not owned by user' });
    }

    return res.status(201).json(inserted);
  } catch (err) {
    next(err);
  }
}

// Retrieves all attachments for an application owned by the user
export async function listAttachments(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { applicationId } = attachmentApplicationIdParamSchema.parse(req.params);
    const { includeDeleted = false } = listAttachmentQuerySchema.parse(req.query);

    const items = await attachmentModel.listAttachments(applicationId, userId, includeDeleted);
    return res.json(items);
  } catch (err) {
    next(err);
  }
}

// Retrieves a specific attachment by ID for the authenticated user
export async function getAttachment(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { attachmentId } = attachmentIdParamSchema.parse(req.params);
    const row = await attachmentModel.getAttachmentById(attachmentId, userId);
    if (!row) return res.status(404).json({ error: 'Attachment not found' });

    return res.json(row);
  } catch (err) {
    next(err);
  }
}

// Downloads the attachment file if it exists
export async function downloadAttachment(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { attachmentId } = attachmentIdParamSchema.parse(req.params);
    const row = await attachmentModel.getAttachmentById(attachmentId, userId);
    if (!row) return res.status(404).json({ error: 'Attachment not found' });

    const abs = storage.storagePath(row.storage_key);
    res.setHeader('Content-Type', row.mime_type ?? 'application/octet-stream');
    const name = row.filename_original || `attachment-${row.id}`;
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(name)}"`);

    return res.sendFile(abs);
  } catch (err) {
    next(err);
  }
}

// Soft-deletes the attachment by setting deleted_at
export async function deleteAttachment(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { attachmentId } = attachmentIdParamSchema.parse(req.params);
    const ok = await attachmentModel.softDeleteAttachment(attachmentId, userId);
    if (!ok) return res.status(404).json({ error: 'Attachment not found or already deleted' });

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
