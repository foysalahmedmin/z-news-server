import { z } from 'zod';

// Common schema parts
const idSchema = z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
  message: 'Invalid ID format',
});

export const createViewValidationSchema = z.object({
  body: z.object({
    news: idSchema,
  }),
});

export const newsViewOperationValidationSchema = z.object({
  params: z.object({
    news_id: idSchema,
  }),
});

export const viewOperationValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
});

export const viewsOperationValidationSchema = z.object({
  body: z.object({
    ids: z.array(idSchema).nonempty('At least one reaction ID is required'),
  }),
});
