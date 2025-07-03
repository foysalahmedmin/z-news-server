import { TRole } from '../user/user.type';

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
  password: string;
};

export type TJwtPayload = {
  _id?: string | undefined;
  name: string;
  email: string;
  role: TRole;
};
