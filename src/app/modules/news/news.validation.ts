import { z } from 'zod';

const idSchema = z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
  message: 'Invalid ID format',
});

const statusEnum = z.enum(['draft', 'pending', 'published', 'archived']);

const seoSchema = z
  .object({
    image: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.preprocess((val) => {
      if (!val) return [];
      return Array.isArray(val) ? val.filter(Boolean) : [val].filter(Boolean);
    }, z.array(z.string()).optional()),
  })
  .optional();

export const createNewsValidationSchema = z.object({
  body: z.object({
    writer: z.string().optional(),
    sequence: z.coerce
      .number({ invalid_type_error: 'Sequence must be a number' })
      .int('Sequence must be an integer')
      .nonnegative('Sequence must be 0 or greater')
      .optional(),
    title: z.string().trim().min(1, 'Title is required'),
    sub_title: z.string().trim().optional(),
    slug: z.string().trim().min(1),
    caption: z.string().max(3000).optional(),
    description: z.string().max(3000).optional(),
    content: z.string().min(1, 'Content is required'),
    youtube: z.string().optional(),
    tags: z.preprocess((val) => {
      if (!val) return [];
      return Array.isArray(val) ? val.filter(Boolean) : [val].filter(Boolean);
    }, z.array(z.string()).optional()),
    category: idSchema.optional(),
    categories: z.preprocess((val) => {
      if (!val) return [];
      return Array.isArray(val) ? val.filter(Boolean) : [val].filter(Boolean);
    }, z.array(idSchema).optional()),
    event: idSchema.optional(),
    status: statusEnum.optional(),
    layout: z.string().optional(),
    is_featured: z
      .preprocess((val) => {
        if (val === 'true' || val === true) return true;
        if (val === 'false' || val === false) return false;
        return val;
      }, z.boolean())
      .optional(),
    is_premium: z
      .preprocess((val) => {
        if (val === 'true' || val === true) return true;
        if (val === 'false' || val === false) return false;
        return val;
      }, z.boolean())
      .optional(),
    published_at: z.coerce.date().optional(),
    expired_at: z.coerce.date().optional(),
    seo: seoSchema,
    is_news_headline: z
      .preprocess((val) => {
        if (val === 'true' || val === true) return true;
        if (val === 'false' || val === false) return false;
        return val;
      }, z.boolean())
      .optional(),
    is_news_break: z
      .preprocess((val) => {
        if (val === 'true' || val === true) return true;
        if (val === 'false' || val === false) return false;
        return val;
      }, z.boolean())
      .optional(),
  }),
});

export const updateSelfNewsValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: z.object({
    writer: z.string().optional(),
    sequence: z.coerce
      .number({ invalid_type_error: 'Sequence must be a number' })
      .int('Sequence must be an integer')
      .nonnegative('Sequence must be 0 or greater')
      .optional(),
    title: z.string().trim().min(1).optional(),
    sub_title: z.string().trim().optional(),
    slug: z.string().trim().min(1).optional(),
    caption: z.string().max(3000).optional(),
    description: z.string().max(3000).optional(),
    content: z.string().min(1).optional(),
    youtube: z.string().optional(),
    tags: z.preprocess((val) => {
      if (!val) return [];
      return Array.isArray(val) ? val.filter(Boolean) : [val].filter(Boolean);
    }, z.array(z.string()).optional()),
    category: idSchema.optional(),
    categories: z.preprocess((val) => {
      if (!val) return [];
      return Array.isArray(val) ? val.filter(Boolean) : [val].filter(Boolean);
    }, z.array(idSchema).optional()),
    event: idSchema.optional(),
    status: statusEnum.optional(),
    layout: z.string().optional(),
    is_featured: z
      .preprocess((val) => {
        if (val === 'true' || val === true) return true;
        if (val === 'false' || val === false) return false;
        return val;
      }, z.boolean())
      .optional(),
    is_premium: z
      .preprocess((val) => {
        if (val === 'true' || val === true) return true;
        if (val === 'false' || val === false) return false;
        return val;
      }, z.boolean())
      .optional(),
    published_at: z.coerce.date().optional(),
    expired_at: z.coerce.date().optional(),
    seo: seoSchema,
    is_news_headline: z
      .preprocess((val) => {
        if (val === 'true' || val === true) return true;
        if (val === 'false' || val === false) return false;
        return val;
      }, z.boolean())
      .optional(),
    is_news_break: z
      .preprocess((val) => {
        if (val === 'true' || val === true) return true;
        if (val === 'false' || val === false) return false;
        return val;
      }, z.boolean())
      .optional(),
    thumbnail: z.string().nullable().optional(),
  }),
});

export const updateNewsValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: z.object({
    writer: z.string().optional(),
    sequence: z.coerce
      .number({ invalid_type_error: 'Sequence must be a number' })
      .int('Sequence must be an integer')
      .nonnegative('Sequence must be 0 or greater')
      .optional(),
    title: z.string().trim().min(1).optional(),
    sub_title: z.string().trim().optional(),
    slug: z.string().trim().min(1).optional(),
    caption: z.string().max(3000).optional(),
    description: z.string().max(3000).optional(),
    content: z.string().min(1).optional(),
    tags: z.preprocess((val) => {
      if (!val) return [];
      return Array.isArray(val) ? val.filter(Boolean) : [val].filter(Boolean);
    }, z.array(z.string()).optional()),
    category: idSchema.optional(),
    categories: z.preprocess((val) => {
      if (!val) return [];
      return Array.isArray(val) ? val.filter(Boolean) : [val].filter(Boolean);
    }, z.array(idSchema).optional()),
    event: idSchema.optional(),
    status: statusEnum.optional(),
    layout: z.string().optional(),
    is_featured: z
      .preprocess((val) => {
        if (val === 'true' || val === true) return true;
        if (val === 'false' || val === false) return false;
        return val;
      }, z.boolean())
      .optional(),
    is_premium: z
      .preprocess((val) => {
        if (val === 'true' || val === true) return true;
        if (val === 'false' || val === false) return false;
        return val;
      }, z.boolean())
      .optional(),
    published_at: z.coerce.date().optional(),
    expired_at: z.coerce.date().optional(),
    seo: seoSchema,
    is_news_headline: z
      .preprocess((val) => {
        if (val === 'true' || val === true) return true;
        if (val === 'false' || val === false) return false;
        return val;
      }, z.boolean())
      .optional(),
    is_news_break: z
      .preprocess((val) => {
        if (val === 'true' || val === true) return true;
        if (val === 'false' || val === false) return false;
        return val;
      }, z.boolean())
      .optional(),
    thumbnail: z.string().nullable().optional(),
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
