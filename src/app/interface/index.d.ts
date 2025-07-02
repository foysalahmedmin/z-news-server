import { JwtPayload } from 'jsonwebtoken';
import { TJwtPayload } from '../modules/auth/auth.type';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload & TJwtPayload;
    }
  }
}

declare module 'express-session' {
  interface Session {}
}
