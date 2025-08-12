import type { Request, Response, NextFunction } from 'express';

// Optional: central shape for error responses
type ErrorBody = {
  error: string;
  message?: string;
  details?: unknown;
};

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

  // Zod validation errors
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

  // JSON parse errors from body-parser
  // err.type === 'entity.parse.failed' is common
  if (err?.type === 'entity.parse.failed') {
    status = 400;
    body = {
      error: 'InvalidJson',
      message: 'Malformed JSON payload',
    };
    return res.status(status).json(body);
  }

  // Multer errors (file upload)
  // name: 'MulterError', code examples: 'LIMIT_FILE_SIZE', 'LIMIT_FILE_COUNT', 'LIMIT_UNEXPECTED_FILE'
  if (err?.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      status = 413; // Payload Too Large
      body = { error: 'FileTooLarge', message: 'Uploaded file exceeds size limit' };
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      status = 400;
      body = { error: 'TooManyFiles', message: 'Too many files uploaded' };
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      status = 400;
      body = { error: 'UnexpectedFile', message: 'Unexpected file field' };
    } else {
      status = 400;
      body = { error: 'UploadError', message: err.message };
    }
    return res.status(status).json(body);
  }

  // PostgreSQL errors (node-postgres)
  if (err?.code && typeof err.code === 'string') {
    const mapped = mapPgError(err.code);
    if (mapped) {
      status = mapped.status;
      body = { error: 'DatabaseError', message: mapped.message };
      return res.status(status).json(body);
    }
  }

  // Custom errors with a status (e.g., thrown by services)
  if (Number.isInteger(err?.status)) {
    status = err.status;
    body = {
      error: err?.name || 'Error',
      message: err?.message,
      details: err?.details,
    };
    return res.status(status).json(body);
  }

  // Fallback: log and return generic 500 without leaking internals
  // You can replace console.error with a proper logger later
  console.error(err);
  return res.status(status).json(body);
}
