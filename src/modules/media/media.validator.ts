import { z } from 'zod';

export const createMediaValidationSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }).min(1),
    description: z.string().optional(),
    alt_text: z.string().optional(),
    file: z.string({ required_error: 'File ID is required' }),
    type: z.enum(['image', 'video', 'audio', 'document']),
    url: z.string({ required_error: 'URL is required' }).url(),
    thumbnail_url: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const updateMediaValidationSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    alt_text: z.string().optional(),
    thumbnail_url: z.string().url().optional(),
    status: z.enum(['active', 'inactive', 'archived']).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const idSchema = z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
  message: 'Invalid ID format',
});

export const mediaOperationSchema = z.object({
  params: z.object({ id: idSchema }),
});
