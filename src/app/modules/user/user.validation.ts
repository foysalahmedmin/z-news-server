import { z } from 'zod';

export const userValidationSchema = z.object({
  id: z.string(),
  username: z.string(),
  password: z.string().min(6).max(12),
  need_password_change: z.boolean().default(false).optional(),
  role: z.enum(['admin', 'student', 'faculty']),
  status: z.enum(['in-progress', 'blocked']).default('in-progress').optional(),
  is_deleted: z.boolean().default(false).optional(),
});

export const updateUserValidationSchema = z.object({
  id: z.string().optional(),
  username: z.string().optional(),
  password: z.string().min(6).max(12).optional(),
  need_password_change: z.boolean().default(false).optional(),
  role: z.enum(['admin', 'student', 'faculty']).optional(),
  status: z.enum(['in-progress', 'blocked']).default('in-progress').optional(),
  is_deleted: z.boolean().default(false).optional(),
});

export const userValidations = {
  createUserValidation: userValidationSchema,
  updateUserValidationSchema,
};
