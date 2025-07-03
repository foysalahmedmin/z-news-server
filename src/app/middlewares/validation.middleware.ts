import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';

const validation = (schema: AnyZodObject) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        cookies: req.cookies,
        session: req.session,
      });
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default validation;
