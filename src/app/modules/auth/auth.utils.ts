import jwt, { JwtPayload } from 'jsonwebtoken';
import { ExpiresIn } from '../../config';
import { TJwtPayload } from './auth.type';

export const createToken = (
  jwtPayload: Partial<TJwtPayload>,
  secret: string,
  expiresIn: ExpiresIn | number,
) => {
  return jwt.sign(jwtPayload, secret, { expiresIn });
};

export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret) as JwtPayload;
};
