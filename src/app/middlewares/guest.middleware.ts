import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import AppError from '../builder/AppError';
import { TGuest } from '../types/express-session.type';
import catchAsync from '../utils/catchAsync';
import processGuest from '../utils/processGuest';

const guest = (status: 'mandatory' | 'optional') => {
  return catchAsync(
    async (req: Request, _res: Response, next: NextFunction) => {
      if (!req.session?.guest || !req.session.guest._id) {
        await processGuest(req);
      }

      const guest = req.session.guest as TGuest | undefined;

      if ((!guest || !guest._id) && status === 'mandatory') {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          'Unable to establish guest session.',
        );
      }

      if (guest && guest._id) {
        req.guest = guest;
      }

      next();
    },
  );
};

export default guest;
