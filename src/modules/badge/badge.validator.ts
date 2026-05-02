import { z } from 'zod';

const createBadgeSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Badge name is required',
      })
      .max(100, 'Badge name cannot exceed 100 characters'),
    description: z
      .string({
        required_error: 'Badge description is required',
      })
      .max(500, 'Description cannot exceed 500 characters'),
    icon: z.string({
      required_error: 'Badge icon is required',
    }),
    category: z.enum(
      ['reader', 'engagement', 'loyalty', 'contribution', 'achievement'],
      {
        required_error: 'Badge category is required',
      },
    ),
    criteria: z.object({
      type: z.enum(
        [
          'articles_read',
          'comments_posted',
          'reading_streak',
          'reputation_score',
          'years_member',
          'custom',
        ],
        {
          required_error: 'Criteria type is required',
        },
      ),
      threshold: z
        .number({
          required_error: 'Criteria threshold is required',
        })
        .min(0, 'Threshold cannot be negative'),
      description: z.string({
        required_error: 'Criteria description is required',
      }),
    }),
    rarity: z.enum(['common', 'rare', 'epic', 'legendary']).default('common'),
    points: z.number().min(0, 'Points cannot be negative').default(0),
    is_active: z.boolean().default(true),
  }),
});

const updateBadgeSchema = z.object({
  body: z.object({
    name: z
      .string()
      .max(100, 'Badge name cannot exceed 100 characters')
      .optional(),
    description: z
      .string()
      .max(500, 'Description cannot exceed 500 characters')
      .optional(),
    icon: z.string().optional(),
    category: z
      .enum(['reader', 'engagement', 'loyalty', 'contribution', 'achievement'])
      .optional(),
    criteria: z
      .object({
        type: z
          .enum([
            'articles_read',
            'comments_posted',
            'reading_streak',
            'reputation_score',
            'years_member',
            'custom',
          ])
          .optional(),
        threshold: z.number().min(0, 'Threshold cannot be negative').optional(),
        description: z.string().optional(),
      })
      .optional(),
    rarity: z.enum(['common', 'rare', 'epic', 'legendary']).optional(),
    points: z.number().min(0, 'Points cannot be negative').optional(),
    is_active: z.boolean().optional(),
  }),
});

const getBadgesByCategorySchema = z.object({
  params: z.object({
    category: z.enum([
      'reader',
      'engagement',
      'loyalty',
      'contribution',
      'achievement',
    ]),
  }),
});

export const BadgeValidation = {
  createBadgeSchema,
  updateBadgeSchema,
  getBadgesByCategorySchema,
};
