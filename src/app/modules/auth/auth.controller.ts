import httpStatus from 'http-status';
import config from '../../config';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AuthServices } from './auth.service';

const loginUser = catchAsync(async (req, res) => {
  const { refresh_token, access_token, need_password_change, jwt_payload } =
    await AuthServices.loginUser(req.body);

  res.cookie('refresh_token', refresh_token, {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
  });

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'User is logged in successfully!',
    data: {
      access_token,
      need_password_change,
      jwt_payload,
    },
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refresh_token } = req.cookies;
  const result = await AuthServices.refreshToken(refresh_token);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Access token is retrieved successfully!',
    data: result,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const result = await AuthServices.changePassword(req.user, req.body);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Password is changed successfully!',
    data: result,
  });
});

const forgetPassword = catchAsync(async (req, res) => {
  const result = await AuthServices.forgetPassword(req.body);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Password reset link is sent successfully!',
    data: result,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const token = req.headers.authorization as string;
  const result = await AuthServices.resetPassword(req.body, token);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Password is reset successfully!',
    data: result,
  });
});

export const AuthControllers = {
  loginUser,
  refreshToken,
  changePassword,
  forgetPassword,
  resetPassword,
};
