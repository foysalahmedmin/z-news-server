import { z } from 'zod';

// Common schema parts
const idSchema = z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
  message: 'Invalid ID format',
});

const statusEnum = z.enum(['pending', 'approved', 'rejected']);

export const createReactionValidationSchema = z.object({
  body: z.object({
    news: idSchema,
    type: z.enum(['like', 'dislike']),
  }),
});

export const updateSelfReactionValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: z.object({
    type: z.enum(['like', 'dislike']).optional(),
  }),
});

export const updateReactionValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: z.object({
    type: z.enum(['like', 'dislike']).optional(),
    status: statusEnum.optional(),
  }),
});

export const updateSelfReactionsValidationSchema = z.object({
  body: z.object({
    ids: z
      .array(idSchema, {
        required_error: 'At least one reaction ID is required',
        invalid_type_error: 'Reaction IDs must be an array of valid Mongo IDs',
      })
      .nonempty('At least one reaction ID is required'),
    status: statusEnum.optional(),
  }),
});

export const updateReactionsValidationSchema = z.object({
  body: z.object({
    ids: z
      .array(idSchema, {
        required_error: 'At least one reaction ID is required',
        invalid_type_error: 'Reaction IDs must be an array of valid Mongo IDs',
      })
      .nonempty('At least one reaction ID is required'),
    status: statusEnum.optional(),
  }),
});

export const reactionOperationValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
});

export const reactionsOperationValidationSchema = z.object({
  body: z.object({
    ids: z.array(idSchema).nonempty('At least one reaction ID is required'),
  }),
});
