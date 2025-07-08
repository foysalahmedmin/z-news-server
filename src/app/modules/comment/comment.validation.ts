import { z } from 'zod';

// Common schema parts
const idSchema = z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
  message: 'Invalid ID format',
});

const statusEnum = z.enum(['active', 'inactive']);

export const createCommentValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters'),
    code: z
      .string()
      .min(1, 'Code is required')
      .max(20, 'Code cannot exceed 20 characters'),
    sequence: z
      .number({ invalid_type_error: 'Sequence must be a number' })
      .int('Sequence must be an integer')
      .nonnegative('Sequence must be 0 or greater'),
    status: statusEnum.optional(),
  }),
});

export const updateCommentValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters')
      .optional(),
    code: z
      .string()
      .min(1, 'Code is required')
      .max(20, 'Code cannot exceed 20 characters')
      .optional(),
    sequence: z
      .number({ invalid_type_error: 'Sequence must be a number' })
      .int('Sequence must be an integer')
      .nonnegative('Sequence must be 0 or greater')
      .optional(),
    status: statusEnum.optional(),
  }),
});

export const updateCommentsValidationSchema = z.object({
  body: z.object({
    ids: z
      .array(idSchema, {
        required_error: 'At least one comment ID is required',
        invalid_type_error: 'Comment IDs must be an array of valid Mongo IDs',
      })
      .nonempty('At least one comment ID is required'),
    status: statusEnum.optional(),
  }),
});

export const commentOperationValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
});

export const commentsOperationValidationSchema = z.object({
  body: z.object({
    ids: z.array(idSchema).nonempty('At least one comment ID is required'),
  }),
});
