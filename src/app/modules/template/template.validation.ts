import { z } from 'zod';

const idSchema = z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
  message: 'Invalid ID format',
});

const createTemplateValidationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Template name is required'),
    description: z.string().optional(),
    category: idSchema.optional(),
    structure: z.record(z.any()).or(z.array(z.any())), // Support for BlockNote JSON object or array of blocks
    default_fields: z.record(z.any()).optional(),
    is_active: z.boolean().optional(),
  }),
});

const updateTemplateValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: z.object({
    name: z.string().trim().min(1).optional(),
    description: z.string().optional(),
    category: idSchema.optional(),
    structure: z.record(z.any()).or(z.array(z.any())).optional(),
    default_fields: z.record(z.any()).optional(),
    is_active: z.boolean().optional(),
  }),
});

const templateOperationValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
});

export const TemplateValidation = {
  createTemplateValidationSchema,
  updateTemplateValidationSchema,
  templateOperationValidationSchema,
};
