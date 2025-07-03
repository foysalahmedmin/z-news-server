import { z } from 'zod';

export const userValidationSchema = z.object({
  body: z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6).max(12),
    status: z
      .enum(['in-progress', 'blocked'])
      .default('in-progress')
      .optional(),
  }),
});
