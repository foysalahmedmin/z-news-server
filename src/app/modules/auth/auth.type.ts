import { TRole } from '../user/user.type';

export type TSignin = {
  email: string;
  password: string;
};

export type TSignup = {
  image?: string;
  name: string;
  email: string;
  password: string;
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
  _id: string;
  image?: string;
  name: string;
  email: string;
  role: TRole;
};
