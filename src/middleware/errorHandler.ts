import type { Request, Response, NextFunction } from 'express';

// Optional: central shape for error responses
type ErrorBody = {
  error: string;
  message?: string;
  details?: unknown;
};

type PgError = Error & { code?: string; detail?: string; constraint?: string };

// Maps PostgreSQL error codes to HTTP status and messages
function mapPgError(code: string): { status: number; message: string } | null {
  switch (code) {
    case '23505': // unique_violation
      return { status: 409, message: 'Duplicate entry' };
    case '23503': // foreign_key_violation
      return { status: 409, message: 'Foreign key violation' };
    case '23502': // not_null_violation
      return { status: 400, message: 'Missing required field' };
    case '23514': // check_violation
      return { status: 400, message: 'Invalid value (check constraint failed)' };
    case '22P02': // invalid_text_representation (e.g., invalid integer)
      return { status: 400, message: 'Invalid input syntax' };
    default:
      return null;
  }
}

/**
 * Centralized API error handler.
 * Place this AFTER all routes: app.use(errorHandler)
 */
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  // Default
  let status = 500;
  let body: ErrorBody = { error: 'InternalServerError' };

  // 1) Zod validation errors
  if (err?.name === 'ZodError' || Array.isArray(err?.issues)) {
    status = 400;
    body = {
      error: 'ValidationError',
      details: err.issues?.map((i: any) => ({
        path: i.path,
        message: i.message,
      })),
    };
    return res.status(status).json(body);
  }

  // 2) JSON parse errors (body-parser)
  if (err?.type === 'entity.parse.failed') {
    status = 400;
    body = {
      error: 'InvalidJson',
      message: 'Malformed JSON payload',
    };
    return res.status(status).json(body);
  }

  // 3) Multer (file upload) errors
  if (err?.name === 'MulterError') {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        status = 413;
        body = { error: 'FileTooLarge', message: 'Uploaded file exceeds size limit' };
        break;
      case 'LIMIT_FILE_COUNT':
        status = 400;
        body = { error: 'TooManyFiles', message: 'Too many files uploaded' };
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        status = 400;
        body = { error: 'UnexpectedFile', message: 'Unexpected file field' };
        break;
      default:
        status = 400;
        body = { error: 'UploadError', message: err.message };
    }
    return res.status(status).json(body);
  }

  // 4) JWT/Auth errors (optional – je nach Middleware)
  if (err?.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'TokenExpired', message: 'JWT expired' });
  }
  if (err?.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'InvalidToken', message: err.message });
  }

  // 5) PostgreSQL errors
  if (typeof (err as PgError).code === 'string') {
    const mapped = mapPgError((err as PgError).code!);
    if (mapped) {
      status = mapped.status;
      body = { error: 'DatabaseError', message: mapped.message };
      return res.status(status).json(body);
    }
  }

  // 6) Custom errors that carry an HTTP status
  if (Number.isInteger(err?.status)) {
    status = err.status;
    body = {
      error: err?.name || 'Error',
      message: err?.message,
      details: err?.details,
    };
    return res.status(status).json(body);
  }

  // 7) Fallback for any other errors
  console.error(err);
  return res.status(status).json(body);
}
