import express from 'express';
import auth from '../../middlewares/auth.middleware';
import file from '../../middlewares/file.middleware';
import validation from '../../middlewares/validation.middleware';
import * as AuthControllers from './auth.controller';
import * as AuthValidations from './auth.validation';

const router = express.Router();

router.post(
  '/signin',
  validation(AuthValidations.signinValidationSchema),
  AuthControllers.signin,
);

router.post(
  '/signup',
  file({
    name: 'image',
    folder: '/user',
    size: 5_000_000,
    maxCount: 1,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  }),
  validation(AuthValidations.signupValidationSchema),
  AuthControllers.signup,
);

router.post(
  '/refresh-token',
  validation(AuthValidations.refreshTokenValidationSchema),
  AuthControllers.refreshToken,
);

router.patch(
  '/change-password',
  auth('admin', 'editor', 'author', 'contributor', 'subscriber', 'user'),
  validation(AuthValidations.changePasswordValidationSchema),
  AuthControllers.changePassword,
);

router.post(
  '/forget-password',
  validation(AuthValidations.forgetPasswordValidationSchema),
  AuthControllers.forgetPassword,
);

router.patch(
  '/reset-password',
  validation(AuthValidations.resetPasswordValidationSchema),
  AuthControllers.resetPassword,
);

router.post(
  '/email-verification-source',
  auth('admin', 'editor', 'author', 'contributor', 'subscriber', 'user'),
  AuthControllers.emailVerificationSource,
);

router.post('/email-verification', AuthControllers.emailVerification);

const authRoutes = router;

export default authRoutes;
