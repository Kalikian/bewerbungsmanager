import type { Request, Response, NextFunction } from 'express';
import * as noteModel from '../../models/application/noteModel.js';

// Retrieves all notes for a specific application
export async function getNotesForApplication(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const applicationId = Number(req.params.applicationId);
    if (Number.isNaN(applicationId))
      return res.status(400).json({ error: 'Invalid applicationId' });

    const notes = await noteModel.getNotesForApplication(applicationId, userId);
    return res.status(200).json(notes);
  } catch {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Creates a new note for an application
export async function createNote(req: Request, res: Response, next: NextFunction) {
  try {
    const applicationId = Number(req.params.applicationId);
    if (!Number.isInteger(applicationId) || applicationId <= 0) {
      return res.status(400).json({ message: 'Invalid applicationId' });
    }
    const userId = req.user.id as number;

    const note = await noteModel.createNote(applicationId, userId, {
      date: req.body?.date ?? null,
      text: req.body.text,
    });

    if (!note) return res.status(404).json({ message: 'Application not found or not owned' });
    return res.status(201).json(note);
  } catch (error) {
    next(error);
  }
}

// Updates an existing note
export async function updateNote(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id, date, text } = req.body ?? {};
    if (!id) return res.status(400).json({ error: 'id is required' });

    const updated = await noteModel.updateNote(
      {
        id: Number(id),
        date: date ? new Date(date) : undefined,
        text, // optional
      },
      userId,
    );

    if (!updated) {
      return res.status(404).json({ error: 'Note not found / not owned or nothing to update' });
    }
    return res.status(200).json(updated);
  } catch {
    next();
  }
}

// Deletes a note by ID
export async function deleteNote(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const noteId = Number(req.params.noteId);
    if (Number.isNaN(noteId)) return res.status(400).json({ error: 'Invalid noteId' });

    const ok = await noteModel.deleteNote(noteId, userId);
    if (!ok) return res.status(404).json({ error: 'Note not found or not owned by user' });

    return res.status(204).send();
  } catch {
    next();
  }
}
