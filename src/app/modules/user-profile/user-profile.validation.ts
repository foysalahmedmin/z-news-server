import { z } from 'zod';

const createUserProfileSchema = z.object({
  body: z.object({
    bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
    location: z
      .string()
      .max(100, 'Location cannot exceed 100 characters')
      .optional(),
    website: z
      .string()
      .url('Invalid website URL')
      .max(200, 'Website URL cannot exceed 200 characters')
      .optional(),
    social_links: z
      .object({
        twitter: z.string().url('Invalid Twitter URL').optional(),
        facebook: z.string().url('Invalid Facebook URL').optional(),
        linkedin: z.string().url('Invalid LinkedIn URL').optional(),
        instagram: z.string().url('Invalid Instagram URL').optional(),
      })
      .optional(),
  }),
});

const updateUserProfileSchema = z.object({
  body: z.object({
    bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
    location: z
      .string()
      .max(100, 'Location cannot exceed 100 characters')
      .optional(),
    website: z
      .string()
      .url('Invalid website URL')
      .max(200, 'Website URL cannot exceed 200 characters')
      .optional(),
    social_links: z
      .object({
        twitter: z.string().url('Invalid Twitter URL').optional(),
        facebook: z.string().url('Invalid Facebook URL').optional(),
        linkedin: z.string().url('Invalid LinkedIn URL').optional(),
        instagram: z.string().url('Invalid Instagram URL').optional(),
      })
      .optional(),
  }),
});

const updateNotificationPreferencesSchema = z.object({
  body: z.object({
    notification_preferences: z
      .object({
        email_notifications: z.boolean().optional(),
        push_notifications: z.boolean().optional(),
        comment_replies: z.boolean().optional(),
        article_updates: z.boolean().optional(),
        newsletter: z.boolean().optional(),
      })
      .optional(),
    email_frequency: z.enum(['instant', 'daily', 'weekly', 'never']).optional(),
  }),
});

const followAuthorSchema = z.object({
  body: z.object({
    author_id: z.string({
      required_error: 'Author ID is required',
    }),
  }),
});

const followCategorySchema = z.object({
  body: z.object({
    category_id: z.string({
      required_error: 'Category ID is required',
    }),
  }),
});

const followTopicSchema = z.object({
  body: z.object({
    topic: z.string({
      required_error: 'Topic is required',
    }),
  }),
});

const addBadgeSchema = z.object({
  params: z.object({
    userId: z.string({
      required_error: 'User ID is required',
    }),
  }),
  body: z.object({
    badge_id: z.string({
      required_error: 'Badge ID is required',
    }),
  }),
});

export const UserProfileValidation = {
  createUserProfileSchema,
  updateUserProfileSchema,
  updateNotificationPreferencesSchema,
  followAuthorSchema,
  followCategorySchema,
  followTopicSchema,
  addBadgeSchema,
};
