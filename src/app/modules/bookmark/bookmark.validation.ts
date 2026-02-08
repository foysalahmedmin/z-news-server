import { z } from 'zod';

// Bookmark Validations
const createBookmarkSchema = z.object({
  body: z.object({
    news: z.string({
      required_error: 'News ID is required',
    }),
    reading_list: z.string().optional(),
    notes: z
      .string()
      .max(1000, 'Notes cannot exceed 1000 characters')
      .optional(),
  }),
});

const updateBookmarkSchema = z.object({
  body: z.object({
    reading_list: z.string().optional(),
    notes: z
      .string()
      .max(1000, 'Notes cannot exceed 1000 characters')
      .optional(),
    is_read: z.boolean().optional(),
  }),
});

const moveToReadingListSchema = z.object({
  params: z.object({
    bookmarkId: z.string({
      required_error: 'Bookmark ID is required',
    }),
  }),
  body: z.object({
    reading_list_id: z.string({
      required_error: 'Reading list ID is required',
    }),
  }),
});

// Reading List Validations
const createReadingListSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Name is required',
      })
      .max(100, 'Name cannot exceed 100 characters'),
    description: z
      .string()
      .max(500, 'Description cannot exceed 500 characters')
      .optional(),
    is_public: z.boolean().optional(),
  }),
});

const updateReadingListSchema = z.object({
  body: z.object({
    name: z.string().max(100, 'Name cannot exceed 100 characters').optional(),
    description: z
      .string()
      .max(500, 'Description cannot exceed 500 characters')
      .optional(),
    is_public: z.boolean().optional(),
  }),
});

const addBookmarkToListSchema = z.object({
  params: z.object({
    listId: z.string({
      required_error: 'List ID is required',
    }),
  }),
  body: z.object({
    bookmark_id: z.string({
      required_error: 'Bookmark ID is required',
    }),
  }),
});

const followReadingListSchema = z.object({
  params: z.object({
    listId: z.string({
      required_error: 'List ID is required',
    }),
  }),
});

export const BookmarkValidation = {
  createBookmarkSchema,
  updateBookmarkSchema,
  moveToReadingListSchema,
  createReadingListSchema,
  updateReadingListSchema,
  addBookmarkToListSchema,
  followReadingListSchema,
};
