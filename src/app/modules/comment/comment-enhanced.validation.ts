import { z } from 'zod';

// Common schema parts
const idSchema = z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
  message: 'Invalid ID format',
});

// ============ THREADING VALIDATIONS ============

export const createReplySchema = z.object({
  params: z.object({
    comment_id: idSchema,
  }),
  body: z.object({
    content: z
      .string()
      .trim()
      .min(1, 'Content is required')
      .max(1000, 'Content cannot exceed 1000 characters'),
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters'),
    email: z.string().email('Invalid email format'),
    reply_to_user: idSchema.optional(),
  }),
});

export const getCommentRepliesSchema = z.object({
  params: z.object({
    comment_id: idSchema,
  }),
});

export const getThreadedCommentsSchema = z.object({
  params: z.object({
    news_id: idSchema,
  }),
});

// ============ REACTION VALIDATIONS ============

export const addReactionSchema = z.object({
  params: z.object({
    comment_id: idSchema,
  }),
  body: z.object({
    type: z.enum(['like', 'insightful', 'funny', 'disagree'], {
      required_error: 'Reaction type is required',
    }),
  }),
});

export const removeReactionSchema = z.object({
  params: z.object({
    comment_id: idSchema,
  }),
});

// ============ PINNING VALIDATIONS ============

export const pinCommentSchema = z.object({
  params: z.object({
    comment_id: idSchema,
  }),
});

export const unpinCommentSchema = z.object({
  params: z.object({
    comment_id: idSchema,
  }),
});

// ============ MODERATION VALIDATIONS ============

export const flagCommentSchema = z.object({
  params: z.object({
    comment_id: idSchema,
  }),
  body: z.object({
    reason: z
      .string()
      .max(500, 'Reason cannot exceed 500 characters')
      .optional(),
  }),
});

export const unflagCommentSchema = z.object({
  params: z.object({
    comment_id: idSchema,
  }),
});

export const moderateCommentSchema = z.object({
  params: z.object({
    comment_id: idSchema,
  }),
  body: z.object({
    status: z.enum(['approved', 'rejected'], {
      required_error: 'Status is required',
    }),
    reason: z
      .string()
      .max(500, 'Reason cannot exceed 500 characters')
      .optional(),
  }),
});

export const getFlaggedCommentsSchema = z.object({
  query: z.object({
    min_flags: z.string().optional(),
  }),
});

// ============ EDIT HISTORY VALIDATIONS ============

export const updateCommentWithHistorySchema = z.object({
  params: z.object({
    comment_id: idSchema,
  }),
  body: z.object({
    content: z
      .string({
        required_error: 'Content is required',
      })
      .trim()
      .min(1, 'Content cannot be empty')
      .max(1000, 'Content cannot exceed 1000 characters'),
  }),
});

export const getEditHistorySchema = z.object({
  params: z.object({
    comment_id: idSchema,
  }),
});

export const EnhancedCommentValidation = {
  // Threading
  createReplySchema,
  getCommentRepliesSchema,
  getThreadedCommentsSchema,

  // Reactions
  addReactionSchema,
  removeReactionSchema,

  // Pinning
  pinCommentSchema,
  unpinCommentSchema,

  // Moderation
  flagCommentSchema,
  unflagCommentSchema,
  moderateCommentSchema,
  getFlaggedCommentsSchema,

  // Edit History
  updateCommentWithHistorySchema,
  getEditHistorySchema,
};
