import { z } from 'zod';

// Common schema parts
const idSchema = z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
  message: 'Invalid ID format',
});

const statusEnum = z.enum(['active', 'inactive']);

export const createCategoryValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters'),
    slug: z
      .string()
      .min(1, 'Slug is required')
      .max(50, 'Slug cannot exceed 50 characters'),
    sequence: z
      .number({ invalid_type_error: 'Sequence must be a number' })
      .int('Sequence must be an integer')
      .nonnegative('Sequence must be 0 or greater'),
    status: statusEnum.optional(),
  }),
});

export const updateCategoryValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters')
      .optional(),
    slug: z
      .string()
      .min(1, 'Slug is required')
      .max(50, 'Slug cannot exceed 50 characters')
      .optional(),
    sequence: z
      .number({ invalid_type_error: 'Sequence must be a number' })
      .int('Sequence must be an integer')
      .nonnegative('Sequence must be 0 or greater')
      .optional(),
    status: statusEnum.optional(),
  }),
});

export const updateCategoriesValidationSchema = z.object({
  body: z.object({
    ids: z
      .array(idSchema, {
        required_error: 'At least one category ID is required',
        invalid_type_error: 'Category IDs must be an array of valid Mongo IDs',
      })
      .nonempty('At least one category ID is required'),
    status: statusEnum.optional(),
  }),
});

export const categoryOperationValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
});

export const categoriesOperationValidationSchema = z.object({
  body: z.object({
    ids: z.array(idSchema).nonempty('At least one category ID is required'),
  }),
});
