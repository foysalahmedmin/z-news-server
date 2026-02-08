import { z } from 'zod';

const createPollSchema = z.object({
  body: z.object({
    news: z.string().optional(),
    title: z
      .string({
        required_error: 'Poll title is required',
      })
      .max(200, 'Title cannot exceed 200 characters'),
    description: z
      .string()
      .max(1000, 'Description cannot exceed 1000 characters')
      .optional(),
    options: z
      .array(
        z.object({
          text: z
            .string({
              required_error: 'Option text is required',
            })
            .max(200, 'Option text cannot exceed 200 characters'),
        }),
      )
      .min(2, 'Poll must have at least 2 options')
      .max(10, 'Poll cannot have more than 10 options'),
    allow_multiple_votes: z.boolean().default(false),
    max_votes: z.number().min(1).default(1),
    allow_anonymous: z.boolean().default(false),
    show_results_before_vote: z.boolean().default(true),
    randomize_options: z.boolean().default(false),
    start_date: z.string().datetime().optional(),
    end_date: z.string().datetime().optional(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    is_featured: z.boolean().default(false),
  }),
});

const updatePollSchema = z.object({
  body: z.object({
    title: z.string().max(200, 'Title cannot exceed 200 characters').optional(),
    description: z
      .string()
      .max(1000, 'Description cannot exceed 1000 characters')
      .optional(),
    allow_multiple_votes: z.boolean().optional(),
    max_votes: z.number().min(1).optional(),
    allow_anonymous: z.boolean().optional(),
    show_results_before_vote: z.boolean().optional(),
    randomize_options: z.boolean().optional(),
    end_date: z.string().datetime().optional(),
    is_active: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    is_featured: z.boolean().optional(),
  }),
});

const voteSchema = z.object({
  params: z.object({
    pollId: z.string({
      required_error: 'Poll ID is required',
    }),
  }),
  body: z.object({
    option_indices: z
      .array(z.number().min(0))
      .min(1, 'At least one option must be selected'),
    guest_id: z.string().optional(), // For anonymous voting
  }),
});

const getPollsByNewsSchema = z.object({
  params: z.object({
    newsId: z.string({
      required_error: 'News ID is required',
    }),
  }),
});

export const PollValidation = {
  createPollSchema,
  updatePollSchema,
  voteSchema,
  getPollsByNewsSchema,
};
