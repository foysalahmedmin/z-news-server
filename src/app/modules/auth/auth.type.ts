import { Types } from 'mongoose';
import { TRole } from '../../types/role';
export type TLogin = {
  id: string;
  password: string;
};

export type TChangePassword = {
  current_password: string;
  new_password: string;
};

export type TForgetPassword = {
  id: string;
};

export type TResetPassword = {
  id: string;
  new_password: string;
};

export type TJwtPayload = {
  _id?: Types.ObjectId;
  id: string;
  username: string;
  email: string;
  role: TRole;
};
