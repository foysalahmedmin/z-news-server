import { z } from 'zod';

const loginValidationSchema = z.object({
  body: z.object({
    id: z.string(),
    password: z.string().min(6).max(12),
  }),
});

const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refresh_token: z.string(),
  }),
});

const changePasswordValidationSchema = z.object({
  body: z
    .object({
      current_password: z.string().min(6).max(12),
      new_password: z.string().min(6).max(12),
    })
    .refine((value) => value.current_password !== value.new_password, {
      message: 'New password must be unique',
    }),
});

const forgetPasswordValidationSchema = z.object({
  body: z.object({
    id: z.string(),
  }),
});

const resetPasswordValidationSchema = z.object({
  body: z.object({
    id: z.string(),
    new_password: z.string().min(6).max(12),
  }),
});

export const AuthValidations = {
  loginValidationSchema,
  changePasswordValidationSchema,
  refreshTokenValidationSchema,
  forgetPasswordValidationSchema,
  resetPasswordValidationSchema,
};
