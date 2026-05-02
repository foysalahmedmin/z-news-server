import { z } from 'zod';

const createArticleVersionSchema = z.object({
  body: z.object({
    news: z.string({
      required_error: 'News ID is required',
    }),
    content_snapshot: z.string({
      required_error: 'Content snapshot is required',
    }),
    metadata_snapshot: z.object({
      title: z.string({
        required_error: 'Title is required',
      }),
      sub_title: z.string().optional(),
      description: z.string().optional(),
      tags: z.array(z.string()).optional(),
      category: z.string().optional(),
      categories: z.array(z.string()).optional(),
      thumbnail: z.string().optional(),
      video: z.string().optional(),
      youtube: z.string().optional(),
    }),
    change_summary: z
      .string()
      .max(500, 'Change summary cannot exceed 500 characters')
      .optional(),
    diff: z
      .object({
        added: z.array(z.string()).optional(),
        removed: z.array(z.string()).optional(),
        modified: z.array(z.string()).optional(),
      })
      .optional(),
  }),
});

const getVersionsByNewsIdSchema = z.object({
  params: z.object({
    newsId: z.string({
      required_error: 'News ID is required',
    }),
  }),
});

const compareVersionsSchema = z.object({
  params: z.object({
    newsId: z.string({
      required_error: 'News ID is required',
    }),
  }),
  query: z.object({
    version1: z.string({
      required_error: 'Version 1 is required',
    }),
    version2: z.string({
      required_error: 'Version 2 is required',
    }),
  }),
});

const restoreVersionSchema = z.object({
  params: z.object({
    versionId: z.string({
      required_error: 'Version ID is required',
    }),
  }),
});

export const ArticleVersionValidation = {
  createArticleVersionSchema,
  getVersionsByNewsIdSchema,
  compareVersionsSchema,
  restoreVersionSchema,
};
