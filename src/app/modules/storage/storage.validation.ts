import { z } from 'zod';

export const createStorageValidationSchema = z.object({
  body: z.object({
    category: z.string().optional(),
    description: z.string().max(500).optional(),
    caption: z.string().max(500).optional(),
    status: z.enum(['active', 'inactive', 'archived']).optional(),
  }),
});

export const updateStorageValidationSchema = z.object({
  body: z.object({
    category: z.string().optional(),
    description: z.string().max(500).optional(),
    caption: z.string().max(500).optional(),
    status: z.enum(['active', 'inactive', 'archived']).optional(),
  }),
});

export const updateStoragesValidationSchema = z.object({
  body: z.object({
    ids: z.array(z.string()),
    status: z.enum(['active', 'inactive', 'archived']),
  }),
});

export const storageOperationValidationSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const storagesOperationValidationSchema = z.object({
  body: z.object({
    ids: z.array(z.string()),
  }),
});
