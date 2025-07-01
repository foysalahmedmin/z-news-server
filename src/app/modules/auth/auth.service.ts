import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import AppError from '../../builder/AppError';
import config from '../../config';
import { sendEmail } from '../../utils/sendEmail';
import { User } from '../user/user.model';
import {
  TChangePassword,
  TForgetPassword,
  TJwtPayload,
  TLogin,
  TResetPassword,
} from './auth.type';
import { createToken, verifyToken } from './auth.utils';

const loginUser = async (payload: TLogin) => {
  const user = await User.isUserExistById(payload.id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  if (user?.is_deleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'User is deleted!');
  }

  if (user?.status == 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'User is blocked!');
  }

  if (!(await User.isPasswordMatched(payload?.password, user?.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched!');
  }

  const jwtPayload: TJwtPayload = {
    _id: user._id,
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_secret_expires_in as string,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_secret_expires_in as string,
  );

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    jwt_payload: jwtPayload,
    need_password_change: user?.need_password_change,
  };
};

const refreshToken = async (token: string) => {
  const { id, iat } = verifyToken(token, config.jwt_refresh_secret as string);

  const user = await User.isUserExistById(id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  if (user?.is_deleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'User is deleted!');
  }

  if (user?.status == 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'User is blocked!');
  }

  if (
    user?.password_changed_at &&
    (await User.isJWTIssuedBeforeChangedPassword(
      user.password_changed_at,
      iat as number,
    ))
  ) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'You do not have the necessary permissions to access this resource.',
    );
  }

  const jwtPayload: TJwtPayload = {
    _id: user._id,
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_secret_expires_in as string,
  );

  return {
    access_token: accessToken,
    jwt_payload: jwtPayload,
  };
};

const changePassword = async (
  userData: JwtPayload,
  payload: TChangePassword,
) => {
  const user = await User.isUserExistById(userData.id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  if (user?.is_deleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User is deleted!');
  }

  if (user?.status == 'blocked') {
    throw new AppError(httpStatus.NOT_FOUND, 'User is blocked!');
  }

  if (
    !(await User.isPasswordMatched(payload?.current_password, user?.password))
  ) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched!');
  }

  const hashedNewPassword = await bcrypt.hash(
    payload.new_password,
    Number(config.bcrypt_salt_rounds),
  );

  const result = await User.findOneAndUpdate(
    {
      id: user.id,
      role: user.role,
    },
    {
      password: hashedNewPassword,
      password_changed_at: new Date(),
      need_password_change: false,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  return result;
};

const forgetPassword = async (payload: TForgetPassword) => {
  const user = await User.isUserExistById(payload.id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  if (user?.is_deleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'User is deleted!');
  }

  if (user?.status == 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'User is blocked!');
  }

  const jwtPayload: TJwtPayload = {
    _id: user._id,
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };

  const resetToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_secret_expires_in as string,
  );

  const resetUILink = `${config.reset_password_ui_link}?id=${user.id}&token=${resetToken}`;

  sendEmail({
    to: user.email,
    subject: 'z-news Password Change Link',
    text: 'Reset your password within 10 minuets',
    html: resetUILink,
  });
};

const resetPassword = async (payload: TResetPassword, token: string) => {
  const user = await User.isUserExistById(payload.id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  if (user?.is_deleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'User is deleted!');
  }

  if (user?.status == 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'User is blocked!');
  }

  const { id } = verifyToken(token, config.jwt_access_secret as string);

  if (payload.id !== id) {
    throw new AppError(httpStatus.FORBIDDEN, 'User is forbidden!');
  }

  const hashedNewPassword = await bcrypt.hash(
    payload.new_password,
    Number(config.bcrypt_salt_rounds),
  );

  const result = await User.findByIdAndUpdate(
    {
      id: user.id,
      role: user.role,
    },
    {
      password: hashedNewPassword,
      password_changed_at: new Date(),
      need_password_change: false,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  return result;
};

export const AuthServices = {
  loginUser,
  refreshToken,
  changePassword,
  forgetPassword,
  resetPassword,
};
