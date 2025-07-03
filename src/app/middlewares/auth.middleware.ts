import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import AppError from '../builder/AppError';
import config from '../config';
import { TJwtPayload } from '../modules/auth/auth.type';
import { User } from '../modules/user/user.model';
import { TRole } from '../modules/user/user.type';
import catchAsync from '../utils/catchAsync';

const auth = (...roles: TRole[]) => {
  return catchAsync(
    async (req: Request, _res: Response, next: NextFunction) => {
      const token = req.headers.authorization;

      if (!token) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          'You do not have the necessary permissions to access this resource.',
        );
      }

      const decoded = jwt.verify(
        token,
        config.jwt_access_secret as string,
      ) as JwtPayload;

      const { _id, role, iat } = decoded;

      if (!_id || !role || typeof iat !== 'number') {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          'You do not have the necessary permissions to access this resource.',
        );
      }

      const user = await User.isUserExist(_id);
      if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
      }

      if (user?.is_deleted) {
        throw new AppError(httpStatus.FORBIDDEN, 'User is deleted!');
      }

      if (user?.status == 'blocked') {
        throw new AppError(httpStatus.FORBIDDEN, 'User is blocked!');
      }

      if (user?.password_changed_at && user.isPasswordChanged(iat)) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          'You do not have the necessary permissions to access this resource.',
        );
      }

      if (roles && !roles.includes(role)) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          'You do not have the necessary permissions to access this resource.',
        );
      }
      req.user = decoded as JwtPayload & TJwtPayload;
      next();
    },
  );
};

export default auth;
