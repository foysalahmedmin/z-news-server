import { Types } from 'mongoose';
import { TRole } from '../../types/role';
export type TSignin = {
  email: string;
  password: string;
};

export type TSignup = {
  name: string;
  email: string;
  password: string;
  role?: TRole;
};

export type TChangePassword = {
  current_password: string;
  new_password: string;
};

export type TForgetPassword = {
  email: string;
};

export type TResetPassword = {
  email: string;
  new_password: string;
};

export type TJwtPayload = {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  role: TRole;
};
