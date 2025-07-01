import jwt, { JwtPayload } from 'jsonwebtoken';
import { TJwtPayload } from './auth.type';

export const createToken = (
  jwtPayload: Partial<TJwtPayload>,
  secret: string,
  expiresIn: string,
) => {
  return jwt.sign(jwtPayload, secret, { expiresIn });
};

export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret) as JwtPayload;
};
