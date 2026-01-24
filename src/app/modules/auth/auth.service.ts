import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import AppError from '../../builder/app-error';
import config from '../../config';
import { TJwtPayload } from '../../types/jsonwebtoken.type';
import { sendEmail } from '../../utils/send-email';
import { User } from '../user/user.model';
import {
  TChangePassword,
  TForgetPassword,
  TResetPassword,
  TSignin,
  TSignup,
} from './auth.type';
import { createToken, verifyToken } from './auth.utils';

const client = new OAuth2Client(config.google_client_id);

export const googleLogin = async (idToken: string) => {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: config.google_client_id,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid google token');
  }

  const { sub: google_id, email, name, picture } = payload;

  if (!email || !name) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Email and name are required from Google',
    );
  }

  let user = (await User.findOne({ email }).select('+password')) as any;

  if (!user) {
    user = (await User.findOne({ google_id }).select('+password')) as any;
  }

  if (user) {
    if (user.is_deleted) {
      throw new AppError(httpStatus.FORBIDDEN, 'User is deleted!');
    }
    if (user.status === 'blocked') {
      throw new AppError(httpStatus.FORBIDDEN, 'User is blocked!');
    }
    if (!user.google_id) {
      user.google_id = google_id;
    }
    user.auth_source = 'google';
    await user.save();
  } else {
    user = await User.create({
      name,
      email,
      google_id,
      auth_source: 'google',
      image: picture,
      role: 'user',
      is_verified: true,
    });
  }

  const jwtPayload: TJwtPayload = {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    ...(user.image && { image: user.image }),
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret!,
    config.jwt_access_secret_expires_in!,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret!,
    config.jwt_refresh_secret_expires_in!,
  );

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    info: jwtPayload,
  };
};

export const signin = async (payload: TSignin) => {
  const user = await User.isUserExistByEmail(payload.email);

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
    !user.password ||
    !(await bcrypt.compare(payload.password, user.password))
  ) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched!');
  }

  const jwtPayload: TJwtPayload = {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    ...(user.image && { image: user.image }),
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret!,
    config.jwt_access_secret_expires_in!,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret!,
    config.jwt_refresh_secret_expires_in!,
  );

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    info: jwtPayload,
  };
};

export const signup = async (payload: TSignup) => {
  const isExist = await User.isUserExistByEmail(payload.email);
  if (isExist) {
    throw new AppError(httpStatus.CONFLICT, 'User already exists!');
  }

  const user = await User.create({ ...payload, auth_source: 'email' });

  if (!user) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to create user!',
    );
  }

  const jwtPayload: TJwtPayload = {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    ...(user.image && { image: user.image }),
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret!,
    config.jwt_access_secret_expires_in!,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret!,
    config.jwt_refresh_secret_expires_in!,
  );

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    info: jwtPayload,
  };
};

export const refreshToken = async (token: string) => {
  const { email, iat } = verifyToken(token, config.jwt_refresh_secret!);

  if (!email || typeof iat !== 'number') {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'You do not have the necessary permissions to access this resource.',
    );
  }

  const user = await User.isUserExistByEmail(email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  if (user?.is_deleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'User is deleted!');
  }

  if (user?.status == 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'User is blocked!');
  }

  if (user?.password_changed_at) {
    const passwordChangedAt = new Date(user.password_changed_at).getTime();
    const tokenIssuedAt = iat * 1000; // convert seconds → ms

    if (passwordChangedAt > tokenIssuedAt) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        'Password recently changed. Please login again.',
      );
    }
  }

  const jwtPayload: TJwtPayload = {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    ...(user.image && { image: user.image }),
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret!,
    config.jwt_access_secret_expires_in!,
  );

  return {
    access_token: accessToken,
    info: jwtPayload,
  };
};

export const changePassword = async (
  user: JwtPayload,
  payload: TChangePassword,
) => {
  const isUserExist = await User.isUserExistByEmail(user.email);

  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  if (
    !isUserExist.password ||
    !(await bcrypt.compare(payload.current_password, isUserExist.password))
  ) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched!');
  }

  const hashedNewPassword = await bcrypt.hash(
    payload.new_password,
    Number(config.bcrypt_salt_rounds),
  );

  const result = await User.findOneAndUpdate(
    {
      email: user.email,
      role: user.role,
    },
    {
      password: hashedNewPassword,
      password_changed_at: new Date(),
    },
    {
      new: true,
      runValidators: true,
    },
  );

  return result;
};

export const forgetPassword = async (payload: TForgetPassword) => {
  const user = await User.isUserExistByEmail(payload.email);

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
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const resetToken = createToken(
    jwtPayload,
    config.jwt_reset_password_secret!,
    config.jwt_reset_password_secret_expires_in || '10m',
  );

  const link = `${config.reset_password_ui_link}?id=${user.email}&token=${resetToken}`;
  const content = `<a href="${link}">Click here to reset your password</a>`;

  sendEmail({
    to: user.email,
    subject: 'Z-News Password Change Link',
    text: 'Reset your password within 10 minuets',
    html: content,
  });
};

export const resetPassword = async (payload: TResetPassword, token: string) => {
  const decoded = verifyToken(token, config.jwt_reset_password_secret!);

  if (!decoded?.email) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'You do not have the necessary permissions to access this resource.',
    );
  }

  const { email } = decoded;

  const user = await User.isUserExistByEmail(email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  if (user?.is_deleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'User is deleted!');
  }

  if (user?.status == 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'User is blocked!');
  }

  const { _id } = user;

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds),
  );

  const result = await User.findByIdAndUpdate(
    _id,
    {
      password: hashedPassword,
      password_changed_at: new Date(),
    },
    {
      new: true,
      runValidators: true,
    },
  );

  return result;
};

export const emailVerificationSource = async (user: TJwtPayload) => {
  const jwtPayload: TJwtPayload = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const resetToken = createToken(
    jwtPayload,
    config.jwt_email_verification_secret!,
    config.jwt_email_verification_secret_expires_in || '10m',
  );

  const link = `${config.email_verification_ui_link}?id=${user.email}&token=${resetToken}`;
  const content = `<a href="${link}">Click here to verify your email</a>`;

  sendEmail({
    to: user.email,
    subject: 'Z-News Email Verification Link',
    text: 'Verify your email within 10 minuets',
    html: content,
  });
};

export const emailVerification = async (token: string) => {
  const decoded = verifyToken(token, config.jwt_email_verification_secret!);

  if (!decoded?.email) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'You do not have the necessary permissions to access this resource.',
    );
  }

  const { email } = decoded;

  const user = await User.isUserExistByEmail(email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  if (user?.is_deleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'User is deleted!');
  }

  if (user?.status == 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'User is blocked!');
  }

  const { _id } = user;

  const result = await User.findByIdAndUpdate(
    _id,
    {
      is_verified: true,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  return result;
};
