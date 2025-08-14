export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = code || 'HttpError';
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Invalid email or password') {
    super(401, message, 'UNAUTHORIZED');
  }
}
