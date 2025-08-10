import { Session, SessionData } from 'express-session';
import { JwtPayload } from 'jsonwebtoken';
import { TJwtPayload } from '../modules/auth/auth.type';
import { TGuest } from '../modules/guest/guest.type';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload & TJwtPayload;
      guest: TGuest;
      session: Session & Partial<SessionData>;
      files?: Record<string, Express.Multer.File[] | Express.Multer.File>;
      file?: Express.Multer.File;
    }
  }
}

declare module 'express-session' {
  interface Session {
    guest?: TGuest;
  }
}
