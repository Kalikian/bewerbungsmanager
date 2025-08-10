import type { Request, Response } from 'express';
import * as applicationModel from '../../models/application/applicationModel.js';
import { UpdateApplication } from '../../types/application.js';

// Creates a new job application
export async function createApplication(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const newApp = await applicationModel.createApplication({
      user_id: userId, // always take user_id from token
      ...req.body,
    });

    res.status(201).json(newApp);
  } catch (err) {
    console.error('error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Retrieves all applications for the authenticated user
export async function getApplications(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const apps = await applicationModel.getApplications(userId);
    res.json(apps);
  } catch (err) {
    console.error('error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Updates an existing application
export async function updateApplication(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const updateData: UpdateApplication = {
      id: req.params.id ? Number(req.params.id) : 0,
      ...req.body,
    };

    // Validate ID
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid application ID' });
    }

    // Ensure the application belongs to the user
    const updatedApp = await applicationModel.updateApplication(updateData, userId);
    if (!updatedApp) {
      return res.status(404).json({ error: 'Application not found or not owned by user' });
    }

    res.json(updatedApp);
  } catch (err) {
    console.error('error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Deletes an application by ID
export async function deleteApplication(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const appId = Number(req.params.id);
    if (!appId) return res.status(400).json({ error: 'Invalid application ID' });

    // Validate ID
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid application ID' });
    }

    const deleted = await applicationModel.deleteApplication(appId, userId); // model already checks ownership
    if (!deleted) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('deleteApplicationController error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
