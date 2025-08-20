import type { Request, Response, NextFunction } from 'express';
import * as applicationModel from '../../models/application/applicationModel.js';
import { UpdateApplication } from '../../types/application/application.js';
import {
  createApplicationSchema,
  updateApplicationSchema,
  applicationIdParamSchema,
} from '../../validation/application/applicationSchema.js';
import { UnauthorizedError } from '../../errors.js';

/* ---------------------------- Controller functions ---------------------------- */

/**
 * Create a new application for the authenticated user.
 * - Requires authentication (user id from token).
 * - Validates request body with Zod (throws ZodError -> handled centrally as 422).
 * - Returns 201 + created row.
 */
export async function createApplication(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError('Authentication required');

    const body = createApplicationSchema.parse(req.body);

    const newApp = await applicationModel.createApplication({
      user_id: userId,
      ...body,
    });

    res.status(201).json(newApp);
  } catch (err) {
    next(err);
  }
}

/**
 * List all applications for the authenticated user.
 * - Requires authentication.
 * - Returns 200 + array of applications.
 */
export async function getApplications(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError('Authentication required');

    const apps = await applicationModel.getApplications(userId);
    res.json(apps);
  } catch (err) {
    next(err);
  }
}

/**
 * Get a single application (owned by the authenticated user).
 * - Requires authentication.
 * - Validates :id with Zod.
 * - Model throws NotFoundError(404) if not found/not owned; we do not inline-respond here.
 */
export async function getApplicationById(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError('Authentication required');

    const { id } = applicationIdParamSchema.parse(req.params);

    const app = await applicationModel.getApplicationById(id, userId);
    res.json(app);
  } catch (err) {
    next(err);
  }
}

/**
 * Partially update an application (owned by the authenticated user).
 * - Requires authentication.
 * - Validates body with Zod (partial schema).
 * - Model throws:
 *    - BadRequestError(400) if no updatable fields provided
 *    - NotFoundError(404) if record does not exist or is not owned by the user
 * - Returns 200 + updated row on success.
 */
export async function updateApplication(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError('Authentication required');

    const { id } = applicationIdParamSchema.parse(req.params);
    const changes = updateApplicationSchema.parse(req.body);

    const updateData: UpdateApplication = { id, ...changes };

    const updatedApp = await applicationModel.updateApplication(updateData, userId);
    res.json(updatedApp);
  } catch (err) {
    next(err);
  }
}

/**
 * Delete an application (owned by the authenticated user).
 * - Requires authentication.
 * - Validates :id with Zod.
 * - Model throws NotFoundError(404) if nothing was deleted.
 * - Returns 204 No Content on success.
 */
export async function deleteApplication(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError('Authentication required');

    const { id } = applicationIdParamSchema.parse(req.params);

    await applicationModel.deleteApplication(id, userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
