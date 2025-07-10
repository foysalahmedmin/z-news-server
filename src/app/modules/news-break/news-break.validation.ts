import { z } from 'zod';

// Common schema parts
const idSchema = z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
  message: 'Invalid ID format',
});

const statusEnum = z.enum(['draft', 'pending', 'published', 'archived']);

export const createNewsValidationSchema = z.object({
  body: z.object({
    sequence: z
      .number({ invalid_type_error: 'Sequence must be a number' })
      .int('Sequence must be an integer')
      .nonnegative('Sequence must be 0 or greater')
      .optional(),
    title: z.string().trim().min(1),
    slug: z
      .string()
      .trim()
      .min(1)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: 'Slug must be lowercase and kebab-case',
      }),
    summary: z.string().max(300).optional(),
    content: z.string().min(1),
    thumbnail: z.string().url().optional(),
    images: z.array(z.string().url()).optional(),
    tags: z.array(z.string().min(1)).optional(),
    author: idSchema,
    status: statusEnum.optional(),
    is_featured: z.boolean().optional(),
    is_premium: z.boolean().optional(),
    seo: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        keywords: z.array(z.string()).optional(),
      })
      .optional(),
    published_at: z.coerce.date().optional(),
  }),
});

export const updateSelfNewsValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: z.object({
    sequence: z
      .number({ invalid_type_error: 'Sequence must be a number' })
      .int('Sequence must be an integer')
      .nonnegative('Sequence must be 0 or greater')
      .optional(),
    title: z.string().trim().min(1).optional(),
    slug: z
      .string()
      .trim()
      .min(1)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: 'Slug must be lowercase and kebab-case',
      })
      .optional(),
    summary: z.string().max(300).optional(),
    content: z.string().min(1).optional(),
    thumbnail: z.string().url().optional(),
    images: z.array(z.string().url()).optional(),
    tags: z.array(z.string().min(1)).optional(),
    author: idSchema.optional(),
    status: statusEnum.optional(),
    is_featured: z.boolean().optional(),
    is_premium: z.boolean().optional(),
    seo: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        keywords: z.array(z.string()).optional(),
      })
      .optional(),
    published_at: z.coerce.date().optional(),
  }),
});

export const updateSelfBulkNewsValidationSchema = z.object({
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

export const updateNewsValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: z.object({
    sequence: z
      .number({ invalid_type_error: 'Sequence must be a number' })
      .int('Sequence must be an integer')
      .nonnegative('Sequence must be 0 or greater')
      .optional(),
    title: z.string().trim().min(1).optional(),
    slug: z
      .string()
      .trim()
      .min(1)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: 'Slug must be lowercase and kebab-case',
      })
      .optional(),
    summary: z.string().max(300).optional(),
    content: z.string().min(1).optional(),
    thumbnail: z.string().url().optional(),
    images: z.array(z.string().url()).optional(),
    tags: z.array(z.string().min(1)).optional(),
    author: idSchema.optional(),
    status: statusEnum.optional(),
    is_featured: z.boolean().optional(),
    is_premium: z.boolean().optional(),
    seo: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        keywords: z.array(z.string()).optional(),
      })
      .optional(),
    published_at: z.coerce.date().optional(),
  }),
});

export const updateBulkNewsValidationSchema = z.object({
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

export const newsOperationValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
});

export const bulkNewsOperationValidationSchema = z.object({
  body: z.object({
    ids: z.array(idSchema).nonempty('At least one news ID is required'),
  }),
});
