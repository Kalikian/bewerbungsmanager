import { UserDB } from '../../models/userModel';

declare global {
  namespace Express {
    interface Request {
      user?: Partial<UserDB> & { id: number; email: string };
    }
  }
}
