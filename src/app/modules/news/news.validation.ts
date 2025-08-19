import { z } from 'zod';

const idSchema = z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
  message: 'Invalid ID format',
});

const statusEnum = z.enum(['draft', 'pending', 'published', 'archived']);

const seoSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  })
  .optional();

export const createNewsValidationSchema = z.object({
  body: z.object({
    sequence: z.coerce
      .number({ invalid_type_error: 'Sequence must be a number' })
      .int('Sequence must be an integer')
      .nonnegative('Sequence must be 0 or greater')
      .optional(),
    title: z.string().trim().min(1, 'Title is required'),
    slug: z
      .string()
      .trim()
      .min(1)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: 'Slug must be lowercase and kebab-case',
      }),
    caption: z.string().max(300).optional(),
    description: z.string().max(300).optional(),
    content: z.string().min(1, 'Content is required'),
    tags: z.array(z.string().min(1)).optional(),
    category: idSchema.optional(),
    author: idSchema.optional(),
    status: statusEnum.optional(),
    layout: z.string().optional(),
    is_featured: z.coerce.boolean().optional(),
    is_premium: z.coerce.boolean().optional(),
    published_at: z.coerce.date().optional(),
    expired_at: z.coerce.date().optional(),
    seo: seoSchema,
    is_news_headline: z.coerce.boolean().optional(),
    is_news_break: z.coerce.boolean().optional(),
  }),
});

export const updateSelfNewsValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: z.object({
    sequence: z.coerce
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
    caption: z.string().max(300).optional(),
    description: z.string().max(300).optional(),
    content: z.string().min(1).optional(),
    tags: z.array(z.string().min(1)).optional(),
    category: idSchema.optional(),
    status: statusEnum.optional(),
    layout: z.string().optional(),
    is_featured: z.coerce.boolean().optional(),
    is_premium: z.coerce.boolean().optional(),
    published_at: z.coerce.date().optional(),
    expired_at: z.coerce.date().optional(),
    seo: seoSchema,
    is_news_headline: z.coerce.boolean().optional(),
    is_news_break: z.coerce.boolean().optional(),
  }),
});

export const updateNewsValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: z.object({
    sequence: z.coerce
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
    caption: z.string().max(300).optional(),
    description: z.string().max(300).optional(),
    content: z.string().min(1).optional(),
    tags: z.array(z.string().min(1)).optional(),
    category: idSchema.optional(),
    author: idSchema.optional(),
    status: statusEnum.optional(),
    layout: z.string().optional(),
    is_featured: z.coerce.boolean().optional(),
    is_premium: z.coerce.boolean().optional(),
    published_at: z.coerce.date().optional(),
    expired_at: z.coerce.date().optional(),
    seo: seoSchema,
    is_news_headline: z.coerce.boolean().optional(),
    is_news_break: z.coerce.boolean().optional(),
  }),
});

export const updateSelfBulkNewsValidationSchema = z.object({
  body: z.object({
    ids: z.array(idSchema).nonempty('At least one news ID is required'),
    status: statusEnum.optional(),
  }),
});

export const updateBulkNewsValidationSchema = z.object({
  body: z.object({
    ids: z.array(idSchema).nonempty('At least one news ID is required'),
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
