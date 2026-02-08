import { z } from 'zod';

// Common schema parts
const idSchema = z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
  message: 'Invalid ID format',
});

const statusEnum = z.enum(['pending', 'approved', 'rejected']);

export const createCommentValidationSchema = z.object({
  body: z.object({
    news: idSchema,
    comment: idSchema.optional(),
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters'),
    email: z.string().email('Invalid email format'),
    content: z
      .string()
      .trim()
      .max(1000, 'Content cannot exceed 1000 characters'),
  }),
});

export const updateSelfCommentValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters'),
    email: z.string().email('Invalid email format'),
    content: z
      .string()
      .trim()
      .max(300, 'Content cannot exceed 300 characters')
      .optional(),
  }),
});

export const updateCommentValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: z.object({
    content: z
      .string()
      .trim()
      .max(300, 'Content cannot exceed 300 characters')
      .optional(),
    status: statusEnum.optional(),
  }),
});

export const updateSelfCommentsValidationSchema = z.object({
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
