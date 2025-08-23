// src/middlewares/auth.ts
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import jwt, { JwtPayload, TokenExpiredError } from 'jsonwebtoken';
import AppError from '../builder/AppError';
import config from '../config';
import { TJwtPayload } from '../modules/auth/auth.type';
import { User } from '../modules/user/user.model';
import { TRole } from '../modules/user/user.type';
import { cacheClient } from '../redis';
import catchAsync from '../utils/catchAsync';

const getUser = async (_id: string) => {
  const redisKey = `auth:user:${_id}`;

  if (!config.redis_enabled) return await User.isUserExist(_id);

  try {
    const cachedUser = await cacheClient.get(redisKey);
    if (cachedUser) return JSON.parse(cachedUser.toString());

    const user = await User.isUserExist(_id);
    if (user) {
      try {
        await cacheClient.set(redisKey, JSON.stringify(user), { EX: 30 * 60 });
      } catch (err) {
        console.warn('Redis set failed:', err);
      }
    }
    return user;
  } catch (err) {
    console.warn('Redis get failed, falling back to DB:', err);
    return await User.isUserExist(_id);
  }
};

const auth = (...roles: (TRole | 'guest')[]) => {
  return catchAsync(
    async (req: Request, _res: Response, next: NextFunction) => {
      const token = req.headers.authorization;

      if (roles.includes('guest') && req.guest?._id && !token) {
        return next();
      }

      if (!token) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'No token provided.');
      }

      let decoded: JwtPayload;
      try {
        decoded = jwt.verify(
          token,
          config.jwt_access_secret as string,
        ) as JwtPayload;
      } catch (err) {
        if (err instanceof TokenExpiredError) {
          throw new AppError(httpStatus.UNAUTHORIZED, 'Token expired');
        }
        throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token');
      }

      const { _id, role, iat } = decoded;

      if (!_id || !role || typeof iat !== 'number') {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token.');
      }

      const user = await getUser(_id);

      if (user.is_deleted) {
        throw new AppError(httpStatus.FORBIDDEN, 'User is deleted');
      }

      if (user?.status === 'blocked') {
        throw new AppError(httpStatus.FORBIDDEN, 'User is blocked');
      }

      if (user?.password_changed_at && user?.isPasswordChanged(iat)) {
        throw new AppError(httpStatus.FORBIDDEN, 'Password recently changed');
      }

      if (!roles.includes(role) || !roles.includes(user?.role)) {
        throw new AppError(httpStatus.FORBIDDEN, 'Access denied');
      }

      req.user = decoded as JwtPayload & TJwtPayload;
      next();
    },
  );
};

export default auth;
