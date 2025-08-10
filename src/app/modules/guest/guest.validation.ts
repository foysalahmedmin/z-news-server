import { z } from 'zod';

const idSchema = z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
  message: 'Invalid ID format',
});

export const updateSelfValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters')
      .optional(),
    email: z.string().email('Invalid email format').optional(),
  }),
});

export const updateGuestValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters')
      .optional(),
    email: z.string().email('Invalid email format').optional(),
    status: z.enum(['in-progress', 'blocked']).optional(),
  }),
});

export const updateGuestsValidationSchema = z.object({
  body: z.object({
    ids: z
      .array(idSchema, {
        required_error: 'At least one Guest ID is required',
        invalid_type_error: 'Guest IDs must be an array of strings',
      })
      .nonempty('At least one Guest ID is required'),
    status: z.enum(['in-progress', 'blocked']).optional(),
  }),
});

export const guestOperationValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
});

export const guestsOperationValidationSchema = z.object({
  body: z.object({
    ids: z.array(idSchema).nonempty('At least one Guest ID is required'),
  }),
});
