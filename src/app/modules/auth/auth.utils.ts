import bcrypt from 'bcrypt';
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

export const isJWTIssuedBeforeChangedPassword = (
  passwordChangedTimestamp: Date,
  JWTIssuedTimestamp: number,
) => {
  return JWTIssuedTimestamp < passwordChangedTimestamp.getTime();
};

export const isPasswordMatched = async (
  plainPassword: string,
  hashedPassword: string,
) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};
