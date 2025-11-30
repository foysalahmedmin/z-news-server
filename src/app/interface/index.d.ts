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
      files?:
        | Record<string, Express.Multer.File[] | Express.Multer.File>
        | Record<string, string[]>; // For upload middleware: _ids array
      file?: Express.Multer.File;
      uploads?: Record<string, string[]>; // For upload middleware: _ids array (same as req.files)
    }
  }
}

declare module 'express-session' {
  interface Session {
    guest?: TGuest;
  }
}
