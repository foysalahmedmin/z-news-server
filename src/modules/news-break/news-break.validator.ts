import { z } from 'zod';

// Common schema parts
const idSchema = z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
  message: 'Invalid ID format',
});

const statusEnum = z.enum(['draft', 'pending', 'published', 'archived']);

export const createNewsBreakValidationSchema = z.object({
  body: z.object({
    news: idSchema,
    status: statusEnum.optional(),
    published_at: z.coerce.date().optional(),
    expired_at: z.coerce.date().optional(),
  }),
});

export const updateSelfNewsBreakValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: z.object({
    news: idSchema.optional(),
    status: statusEnum.optional(),
    published_at: z.coerce.date().optional(),
    expired_at: z.coerce.date().optional(),
  }),
});

export const updateSelfNewsBreaksValidationSchema = z.object({
  body: z.object({
    ids: z
      .array(idSchema, {
        required_error: 'At least one news ID is required',
        invalid_type_error: 'News IDs must be an array of valid Mongo IDs',
      })
      .nonempty('At least one news ID is required'),
    status: statusEnum.optional(),
  }),
});

export const updateNewsBreakValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: z.object({
    news: idSchema.optional(),
    status: statusEnum.optional(),
    published_at: z.coerce.date().optional(),
    expired_at: z.coerce.date().optional(),
  }),
});

export const updateNewsBreaksValidationSchema = z.object({
  body: z.object({
    ids: z
      .array(idSchema, {
        required_error: 'At least one news ID is required',
        invalid_type_error: 'News IDs must be an array of valid Mongo IDs',
      })
      .nonempty('At least one news ID is required'),
    status: statusEnum.optional(),
  }),
});

export const newsBreakOperationValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
});

export const newsBreaksOperationValidationSchema = z.object({
  body: z.object({
    ids: z.array(idSchema).nonempty('At least one news ID is required'),
  }),
});
