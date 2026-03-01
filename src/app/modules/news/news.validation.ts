import { z } from 'zod';

const idSchema = z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
  message: 'Invalid ID format',
});

const statusEnum = z.enum([
  'draft',
  'pending',
  'scheduled',
  'published',
  'archived',
]);

const newsExtraFieldsSchema = {
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  canonical_url: z.string().url().optional().or(z.string().length(0)),
  structured_data: z.record(z.any()).optional(),
  content_type: z
    .enum(['article', 'video', 'podcast', 'live-blog', 'photo-essay'])
    .optional(),
  sensitivity_level: z.enum(['public', 'sensitive', 'restricted']).optional(),
  fact_checked: z
    .preprocess((val) => {
      if (val === 'true' || val === true) return true;
      if (val === 'false' || val === false) return false;
      return val;
    }, z.boolean())
    .optional(),
  fact_checker: idSchema.optional(),
  sources: z
    .array(
      z.object({
        name: z.string(),
        url: z.string().url().optional().or(z.string().length(0)),
        credibility: z.coerce.number().min(0).max(100).optional(),
      }),
    )
    .optional(),
  push_notification_sent: z.boolean().optional(),
  newsletter_included: z.boolean().optional(),
  social_media_posts: z
    .array(
      z.object({
        platform: z.string(),
        post_id: z.string(),
        posted_at: z.coerce.date(),
      }),
    )
    .optional(),
  geo_targeting: z
    .object({
      countries: z.array(z.string()).optional(),
      regions: z.array(z.string()).optional(),
      cities: z.array(z.string()).optional(),
    })
    .optional(),
  gallery: z.array(idSchema).optional(),
  audio: idSchema.optional(),
  podcast_episode: idSchema.optional(),
  infographics: z.array(idSchema).optional(),
  related_articles: z.array(idSchema).optional(),
  series: idSchema.optional(),
};

export const createNewsValidationSchema = z.object({
  body: z.object({
    writer: z.string().optional(),
    title: z.string().trim().min(1, 'Title is required'),
    sub_title: z.string().trim().optional(),
    slug: z.string().trim().min(1),
    description: z.string().max(3000).optional(),
    content: z.string().min(1, 'Content is required'),
    thumbnail: idSchema.optional(),
    video: idSchema.optional(),
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
    published_at: z.coerce.date().optional(),
    expired_at: z.coerce.date().optional(),
    ...newsExtraFieldsSchema,
  }),
});

export const updateSelfNewsValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: z.object({
    writer: z.string().optional(),
    title: z.string().trim().min(1).optional(),
    sub_title: z.string().trim().optional(),
    slug: z.string().trim().min(1).optional(),
    description: z.string().max(3000).optional(),
    content: z.string().min(1).optional(),
    thumbnail: idSchema.nullable().optional(),
    video: idSchema.nullable().optional(),
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
    published_at: z.coerce.date().optional(),
    expired_at: z.coerce.date().optional(),
    ...newsExtraFieldsSchema,
  }),
});

export const updateNewsValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: z.object({
    writer: z.string().optional(),
    title: z.string().trim().min(1).optional(),
    sub_title: z.string().trim().optional(),
    slug: z.string().trim().min(1).optional(),
    description: z.string().max(3000).optional(),
    content: z.string().min(1).optional(),
    thumbnail: idSchema.nullable().optional(),
    video: idSchema.nullable().optional(),
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
    published_at: z.coerce.date().optional(),
    expired_at: z.coerce.date().optional(),
    ...newsExtraFieldsSchema,
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
