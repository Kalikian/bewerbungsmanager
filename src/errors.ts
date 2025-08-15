export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = code || 'HttpError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Invalid email or password') {
    super(401, message, 'UNAUTHORIZED');
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Not found') {
    super(404, message, 'NOT_FOUND');
  }
}
