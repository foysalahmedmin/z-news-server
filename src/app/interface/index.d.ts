import { Session, SessionData } from 'express-session';
import { JwtPayload } from 'jsonwebtoken';
import { TJwtPayload } from '../modules/auth/auth.type';
import { TGuest } from '../types/express-session.type';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload & TJwtPayload;
      guest: TGuest;
      session: Session & Partial<SessionData>;
    }
  }
}

declare module 'express-session' {
  interface Session {
    guest?: TGuest;
  }
}
