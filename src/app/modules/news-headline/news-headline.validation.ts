import { z } from 'zod';

// Common schema parts
const idSchema = z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
  message: 'Invalid ID format',
});

const statusEnum = z.enum(['draft', 'pending', 'published', 'archived']);

export const createNewsHeadlineValidationSchema = z.object({
  body: z.object({
    sequence: z
      .number({ invalid_type_error: 'Sequence must be a number' })
      .int('Sequence must be an integer')
      .nonnegative('Sequence must be 0 or greater')
      .optional(),
    news: idSchema,
    status: statusEnum.optional(),
    published_at: z.coerce.date().optional(),
    expired_at: z.coerce.date().optional(),
  }),
});

export const updateSelfNewsHeadlineValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: z.object({
    sequence: z
      .number({ invalid_type_error: 'Sequence must be a number' })
      .int('Sequence must be an integer')
      .nonnegative('Sequence must be 0 or greater')
      .optional(),
    news: idSchema.optional(),
    status: statusEnum.optional(),
    published_at: z.coerce.date().optional(),
    expired_at: z.coerce.date().optional(),
  }),
});

export const updateSelfNewsHeadlinesValidationSchema = z.object({
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

export const updateNewsHeadlineValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: z.object({
    sequence: z
      .number({ invalid_type_error: 'Sequence must be a number' })
      .int('Sequence must be an integer')
      .nonnegative('Sequence must be 0 or greater')
      .optional(),
    news: idSchema.optional(),
    status: statusEnum.optional(),
    published_at: z.coerce.date().optional(),
    expired_at: z.coerce.date().optional(),
  }),
});

export const updateNewsHeadlinesValidationSchema = z.object({
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

export const newsHeadlineOperationValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
});

export const newsHeadlinesOperationValidationSchema = z.object({
  body: z.object({
    ids: z.array(idSchema).nonempty('At least one news ID is required'),
  }),
});
