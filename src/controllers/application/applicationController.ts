import type { Request, Response, NextFunction } from 'express';
import * as applicationModel from '../../models/application/applicationModel.js';
import { UpdateApplication } from '../../types/application/application.js';
import {
  createApplicationSchema,
  updateApplicationSchema,
  applicationIdParamSchema,
} from '../../validation/application/applicationSchema.js';

// Creates a new job application
export async function createApplication(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const body = createApplicationSchema.parse(req.body);

    const newApp = await applicationModel.createApplication({
      user_id: userId, // always take user_id from token
      ...body,
    });

    res.status(201).json(newApp);
  } catch (err) {
    next(err);
  }
}

// Retrieves all applications for the authenticated user
export async function getApplications(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const apps = await applicationModel.getApplications(userId);
    res.json(apps);
  } catch (err) {
    next(err);
  }
}

// Retrieves a specific application by ID for the authenticated user
export async function getApplicationById(req: Request, res: Response, next: NextFunction) {
  try {
    //Validate & coerce :id param with Zod (no manual Number checks)
    const { id } = applicationIdParamSchema.parse(req.params);

    const userId = req.user.id as number;

    const app = await applicationModel.getApplicationById(id, userId);
    if (!app) return res.status(404).json({ error: 'Application not found' });

    return res.json(app);
  } catch (err) {
    next(err);
  }
}

// Updates an existing application
export async function updateApplication(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = applicationIdParamSchema.parse(req.params);

    const changes = updateApplicationSchema.parse(req.body);

    const updateData: UpdateApplication = {
      id,
      ...changes,
    };

    // Ensure the application belongs to the user
    const updatedApp = await applicationModel.updateApplication(updateData, userId);
    if (!updatedApp) {
      return res.status(404).json({ error: 'Application not found or not owned by user' });
    }

    res.json(updatedApp);
  } catch (err) {
    next(err);
  }
}

// Deletes an application by ID
export async function deleteApplication(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = applicationIdParamSchema.parse(req.params);

    const deleted = await applicationModel.deleteApplication(id, userId); // model already checks ownership
    if (!deleted) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
