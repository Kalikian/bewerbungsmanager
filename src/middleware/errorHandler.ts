import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../errors.js';

// Minimal shapes + guards
type PgError = { code?: string; detail?: string };
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

const isPgError = (e: unknown): e is PgError => isObject(e) && 'code' in e;

const hasName = (e: unknown, name: string): boolean => isObject(e) && e['name'] === name;

type BodyParserError = { type?: string; status?: number };
const isBodyParserError = (e: unknown, type: string): e is BodyParserError =>
  isObject(e) && e['type'] === type;

type MulterLikeError = { name?: string; code?: string; message?: string };
const isMulterError = (e: unknown): e is MulterLikeError =>
  isObject(e) && e['name'] === 'MulterError';

// Map a subset of common PostgreSQL error codes to HTTP responses
function mapPg(e: PgError) {
  switch (e.code) {
    case '23505':
      return { status: 409, error: 'CONFLICT', message: 'Duplicate key' };
    case '23503':
      return { status: 409, error: 'CONFLICT', message: 'Foreign key violation' };
    case '23502':
      return { status: 400, error: 'BAD_REQUEST', message: 'Missing required field' };
    case '23514':
      return { status: 400, error: 'BAD_REQUEST', message: 'Check constraint violation' };
    case '22P02':
      return { status: 400, error: 'BAD_REQUEST', message: 'Invalid input syntax' };
    case '22001':
      return { status: 400, error: 'BAD_REQUEST', message: 'Value too long' };
    case '22003':
      return { status: 400, error: 'BAD_REQUEST', message: 'Numeric value out of range' };
    default:
      return null;
  }
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // If headers are already sent, defer to Express' default handler
  if (res.headersSent) return next(err);

  // Work with `unknown` internally for safe narrowing
  const e: unknown = err;

  // 1) Validation errors (Zod)
  if (e instanceof ZodError) {
    const details = e.issues.map(({ path, message, code }) => ({ path, message, code }));
    return res.status(422).json({
      error: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details,
    });
  }

  // 2) Domain/application errors (custom HttpError hierarchy)
  if (e instanceof HttpError) {
    return res.status(e.status).json({
      error: e.code ?? e.name,
      message: e.message,
      details: e.details,
    });
  }

  // 3) Body parser errors (malformed JSON / too large)
  if (isBodyParserError(e, 'entity.parse.failed')) {
    return res
      .status(400)
      .json({ error: 'BAD_REQUEST', message: 'Malformed JSON in request body' });
  }
  if (isBodyParserError(e, 'entity.too.large')) {
    return res
      .status(413)
      .json({ error: 'PAYLOAD_TOO_LARGE', message: 'Request payload too large' });
  }

  // 4) JWT errors (without importing jsonwebtoken; use the name field)
  if (hasName(e, 'TokenExpiredError')) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token expired' });
  }
  if (hasName(e, 'JsonWebTokenError')) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid token' });
  }

  // 5) File upload errors (Multer-like)
  if (isMulterError(e)) {
    return res.status(400).json({
      error: 'UPLOAD_ERROR',
      message: e.message ?? 'Upload failed',
      details: e.code,
    });
  }

  // 6) PostgreSQL errors
  if (isPgError(e)) {
    const mapped = mapPg(e);
    if (mapped) {
      return res.status(mapped.status).json({ error: mapped.error, message: mapped.message });
    }
  }

  // 7) Fallback (log concisely, avoid leaking internals)
  // Keep logs useful: add request context
  const context = { method: req.method, url: req.originalUrl, ip: req.ip };
  if (process.env.NODE_ENV !== 'production') {
    console.error('Unhandled error:', err, context);
  } else {
    console.error('Unhandled error:', {
      message: (err as any)?.message,
      name: (err as any)?.name,
      ...context,
    });
  }

  return res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Something went wrong',
  });
};
