/* eslint-disable no-console */
import { Flattener } from 'flattener-kit';
import fs from 'fs';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../builder/app-error';
import { TJwtPayload } from '../../types/jsonwebtoken.type';
import {
  generateCacheKey,
  invalidateCacheByPattern,
  withCache,
} from '../../utils/cache.utils';
import { ArticleVersion as ArticleVersionModel } from '../article-version/article-version.model';
import { ArticleVersionService } from '../article-version/article-version.service';
import { Bookmark as BookmarkModel } from '../bookmark/bookmark.model';
import { Category } from '../category/category.model';
import { Comment as CommentModel } from '../comment/comment.model';
import { sendNewsNotification } from '../notification/notification.service';
import { Poll as PollModel } from '../poll/poll.model';
import { Reaction as ReactionModel } from '../reaction/reaction.model';
import * as NewsRepository from './news.repository';
import { TNews } from './news.type';

const CACHE_PREFIX = 'news';
const CACHE_TTL = 1800; // 30 minutes

const getCategoryIds = async ({
  category,
  category_slug,
}: {
  category?: string;
  category_slug?: string;
}) => {
  if (category || category_slug) {
    const categories = await Category.aggregate([
      {
        $match: {
          $or: [
            ...(category
              ? [{ _id: new mongoose.Types.ObjectId(category) }]
              : []),
            ...(category_slug ? [{ slug: category_slug }] : []),
          ],
        },
      },
      {
        $graphLookup: {
          from: 'categories',
          startWith: '$_id',
          connectFromField: '_id',
          connectToField: 'parent',
          as: 'descendants',
        },
      },
      {
        $project: {
          ids: {
            $concatArrays: [
              ['$_id'],
              { $map: { input: '$descendants', as: 'd', in: '$$d._id' } },
            ],
          },
        },
      },
    ]);

    if (!categories.length) return [];

    const categoryIds =
      (categories?.[0]?.ids as mongoose.Types.ObjectId[]) || [];

    return categoryIds;
  }

  return [];
};

export const uploadNewsFile = async (
  file: Express.Multer.File,
  type: 'image' | 'video' | 'audio' | 'file',
  base: string = '',
) => {
  if (!file || !type) return null;

  const path = file?.path.replace(/\\/g, '/');
  const short_path = path.split('/').slice(-3).join('/');

  return {
    type: type,
    filename: file?.filename,
    short_path: short_path,
    path: path,
    url: `${base}/${path}`,
    size: file?.size,
    mimetype: file?.mimetype,
  };
};

export const deleteNewsFile = async (path: string) => {
  if (!path) return;
  fs.unlink(path, (err) => {
    if (err && (err as { code?: string }).code !== 'ENOENT') {
      console.warn(`❌ Failed to delete file: ${path}`, (err as Error).message);
    } else {
      console.log(`🗑️ Deleted file: ${path}`);
    }
  });

  return path;
};

export const getPublicNews = async (slug: string): Promise<TNews> => {
  return await withCache(
    generateCacheKey(CACHE_PREFIX, ['slug', slug]),
    CACHE_TTL,
    async () => {
      const result = await NewsRepository.findOneLean(
        { slug: slug, status: 'published' },
        [
          { path: 'author', select: '_id name email image' },
          { path: 'category', select: '_id name slug' },
          { path: 'categories', select: '_id name slug' },
          { path: 'event', select: '_id name slug' },
          {
            path: 'thumbnail',
            select: '_id url name filename mimetype caption metadata',
          },
          {
            path: 'video',
            select: '_id url name filename mimetype caption metadata',
          },
          { path: 'views' },
          { path: 'likes' },
          { path: 'dislikes' },
          { path: 'comments' },
        ],
      );

      if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'News not found');
      }
      return result;
    },
  );
};

export const getSelfNews = async (
  user: TJwtPayload,
  id: string,
): Promise<TNews> => {
  return await withCache(
    generateCacheKey(CACHE_PREFIX, ['id', id]),
    CACHE_TTL,
    async () => {
      const result = await NewsRepository.findOneLean(
        { _id: id, author: user._id },
        [
          { path: 'views' },
          { path: 'likes' },
          { path: 'dislikes' },
          { path: 'comments' },
          { path: 'author', select: '_id name email image' },
          { path: 'category', select: '_id name slug' },
          { path: 'categories', select: '_id name slug' },
          { path: 'event', select: '_id name slug' },
          {
            path: 'thumbnail',
            select: '_id url name filename mimetype caption metadata',
          },
          {
            path: 'video',
            select: '_id url name filename mimetype caption metadata',
          },
          {
            path: 'news_headline',
            select: '_id status published_at expired_at',
          },
          { path: 'news_break', select: '_id status published_at expired_at' },
        ],
      );
      if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'News not found');
      }
      return result;
    },
  );
};

export const getNews = async (id: string): Promise<TNews> => {
  return await withCache(
    generateCacheKey(CACHE_PREFIX, ['id', id]),
    CACHE_TTL,
    async () => {
      const result = await NewsRepository.findOneLean({ _id: id }, [
        { path: 'views' },
        { path: 'likes' },
        { path: 'dislikes' },
        { path: 'comments' },
        { path: 'author', select: '_id name email image' },
        { path: 'category', select: '_id name slug' },
        { path: 'categories', select: '_id name slug' },
        { path: 'event', select: '_id name slug' },
        {
          path: 'thumbnail',
          select: '_id url name filename mimetype caption metadata',
        },
        {
          path: 'video',
          select: '_id url name filename mimetype caption metadata',
        },
        {
          path: 'news_headline',
          select: '_id status published_at expired_at',
        },
        { path: 'news_break', select: '_id status published_at expired_at' },
      ]);
      if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'News not found');
      }
      return result;
    },
  );
};

export const getPublicBulkNews = async (
  query: Record<string, unknown>,
): Promise<{
  data: TNews[];
  meta: { total: number; page: number; limit: number };
}> => {
  const cacheKey = generateCacheKey(CACHE_PREFIX, ['public', 'list', query]);
  return await withCache(cacheKey, CACHE_TTL, async () => {
    const {
      category: q_category,
      category_slug: q_category_slug,
      published_at: q_published_at,
      published_at_gte: q_published_at_gte,
      published_at_lte: q_published_at_lte,
      date: q_date,
      news_ne,
      ...rest
    } = query;

    const category = q_category as string;
    const category_slug = q_category_slug as string;

    const categories_ids = await getCategoryIds({ category, category_slug });

    if (categories_ids.length > 0) {
      rest.category = { $in: categories_ids };
    }

    if (q_published_at) {
      const start = new Date(q_published_at as string);
      start.setHours(0, 0, 0, 0);

      const end = new Date(q_published_at as string);
      end.setHours(23, 59, 59, 999);

      rest.published_at = { $gte: start, $lte: end };
    } else if (q_published_at_gte || q_published_at_lte) {
      const filter: Record<string, Date> = {};

      if (q_published_at_gte) {
        const start = new Date(q_published_at_gte as string);
        start.setHours(0, 0, 0, 0);
        filter.$gte = start;
      }

      if (q_published_at_lte) {
        const end = new Date(q_published_at_lte as string);
        end.setHours(23, 59, 59, 999);
        filter.$lte = end;
      }

      rest.published_at = filter;
    } else if (q_date) {
      const end = new Date(q_date as string);
      end.setHours(23, 59, 59, 999);

      rest.published_at = { $lte: end };
    } else {
      const end = new Date();

      rest.published_at = { $lte: end };
    }

    if (news_ne) {
      rest._id = { $ne: news_ne };
    }

    const result = await NewsRepository.findPublicPaginated(rest, [
      { path: 'author', select: '_id name email image' },
      { path: 'category', select: '_id name slug' },
      { path: 'categories', select: '_id name slug' },
      { path: 'event', select: '_id name slug' },
      {
        path: 'thumbnail',
        select: '_id url name filename mimetype caption metadata',
      },
      {
        path: 'video',
        select: '_id url name filename mimetype caption metadata',
      },
      { path: 'views' },
      { path: 'likes' },
      { path: 'dislikes' },
      { path: 'comments' },
    ]);
    return result;
  });
};

export const getSelfBulkNews = async (
  user: TJwtPayload,
  query: Record<string, unknown>,
): Promise<{
  data: TNews[];
  meta: { total: number; page: number; limit: number };
}> => {
  const cacheKey = generateCacheKey(CACHE_PREFIX, [
    'self',
    user._id,
    'list',
    query,
  ]);
  return await withCache(cacheKey, CACHE_TTL, async () => {
    const {
      category: q_category,
      category_slug: q_category_slug,
      published_at: q_published_at,
      published_at_gte: q_published_at_gte,
      published_at_lte: q_published_at_lte,
      date: q_date,
      ...rest
    } = query;

    const category = q_category as string;
    const category_slug = q_category_slug as string;

    const categories_ids = await getCategoryIds({ category, category_slug });

    if (categories_ids.length > 0) {
      rest.category = { $in: categories_ids };
    }

    if (q_published_at) {
      const start = new Date(q_published_at as string);
      start.setHours(0, 0, 0, 0);

      const end = new Date(q_published_at as string);
      end.setHours(23, 59, 59, 999);

      rest.published_at = { $gte: start, $lte: end };
    } else if (q_published_at_gte || q_published_at_lte) {
      const filter: Record<string, Date> = {};

      if (q_published_at_gte) {
        const start = new Date(q_published_at_gte as string);
        start.setHours(0, 0, 0, 0);
        filter.$gte = start;
      }

      if (q_published_at_lte) {
        const end = new Date(q_published_at_lte as string);
        end.setHours(23, 59, 59, 999);
        filter.$lte = end;
      }

      rest.published_at = filter;
    } else if (q_date) {
      const end = new Date(q_date as string);
      end.setHours(23, 59, 59, 999);

      rest.published_at = { $lte: end };
    }

    const result = await NewsRepository.findSelfPaginated(
      user._id,
      rest,
      [
        { path: 'author', select: '_id name email image' },
        { path: 'category', select: '_id name slug' },
        { path: 'categories', select: '_id name slug' },
        { path: 'event', select: '_id name slug' },
        {
          path: 'thumbnail',
          select: '_id url name filename mimetype caption metadata',
        },

        { path: 'likes' },
        { path: 'dislikes' },
        { path: 'comments' },
      ],
      [
        {
          key: 'published',
          filter: { status: 'published' },
        },
        {
          key: 'draft',
          filter: { status: 'draft' },
        },
        {
          key: 'pending',
          filter: { status: 'pending' },
        },
      ],
    );
    return result;
  });
};

export const getBulkNews = async (
  query: Record<string, unknown>,
): Promise<{
  data: TNews[];
  meta: { total: number; page: number; limit: number };
}> => {
  const cacheKey = generateCacheKey(CACHE_PREFIX, ['admin', 'list', query]);
  return await withCache(cacheKey, CACHE_TTL, async () => {
    const {
      category: q_category,
      category_slug: q_category_slug,
      published_at: q_published_at,
      published_at_gte: q_published_at_gte,
      published_at_lte: q_published_at_lte,
      date: q_date,
      ...rest
    } = query;

    const category = q_category as string;
    const category_slug = q_category_slug as string;

    const categories_ids = await getCategoryIds({ category, category_slug });

    if (categories_ids.length > 0) {
      rest.category = { $in: categories_ids };
    }

    if (q_published_at) {
      const start = new Date(q_published_at as string);
      start.setHours(0, 0, 0, 0);

      const end = new Date(q_published_at as string);
      end.setHours(23, 59, 59, 999);

      rest.published_at = { $gte: start, $lte: end };
    } else if (q_published_at_gte || q_published_at_lte) {
      const filter: Record<string, Date> = {};

      if (q_published_at_gte) {
        const start = new Date(q_published_at_gte as string);
        start.setHours(0, 0, 0, 0);
        filter.$gte = start;
      }

      if (q_published_at_lte) {
        const end = new Date(q_published_at_lte as string);
        end.setHours(23, 59, 59, 999);
        filter.$lte = end;
      }

      rest.published_at = filter;
    } else if (q_date) {
      const end = new Date(q_date as string);
      end.setHours(23, 59, 59, 999);

      rest.published_at = { $lte: end };
    }

    const result = await NewsRepository.findAdminPaginated(
      rest,
      [
        { path: 'author', select: '_id name email image' },
        { path: 'category', select: '_id name slug' },
        { path: 'categories', select: '_id name slug' },
        { path: 'event', select: '_id name slug' },
        {
          path: 'thumbnail',
          select: '_id url name filename mimetype caption metadata',
        },
        {
          path: 'video',
          select: '_id url name filename mimetype caption metadata',
        },
        { path: 'views' },
        { path: 'likes' },
        { path: 'dislikes' },
        { path: 'comments' },
      ],
      [
        {
          key: 'published',
          filter: { status: 'published' },
        },
        {
          key: 'draft',
          filter: { status: 'draft' },
        },
        {
          key: 'pending',
          filter: { status: 'pending' },
        },
      ],
    );
    return result;
  });
};

export const updateSelfNews = async (
  user: TJwtPayload,
  id: string,
  payload: Partial<
    Pick<
      TNews,
      | 'writer'
      | 'title'
      | 'sub_title'
      | 'slug'
      | 'description'
      | 'content'
      | 'thumbnail'
      | 'video'
      | 'youtube'
      | 'tags'
      | 'category'
      | 'author'
      | 'status'
      | 'is_featured'
      | 'published_at'
      | 'expired_at'
      | 'categories'
    >
  >,
): Promise<TNews> => {
  const data = await NewsRepository.findOneLean({ _id: id, author: user._id });
  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'News not found');
  }

  const update: Partial<TNews> = { ...payload };

  if (
    Object.keys(payload).includes('slug') ||
    Object.keys(payload).includes('title') ||
    Object.keys(payload).includes('content')
  ) {
    update.is_edited = true;
    update.edited_at = new Date();
    update.editor = user._id as unknown as mongoose.Types.ObjectId;
  }

  const flatten = Flattener.flatten(update, { safe: true });

  const result = await NewsRepository.findByIdAndUpdate(id, flatten);

  if (result) {
    await result.populate([
      { path: 'author', select: '_id name email image' },
      { path: 'category', select: '_id name slug' },
      { path: 'categories', select: '_id name slug' },
      { path: 'event', select: '_id name slug' },
      {
        path: 'thumbnail',
        select: '_id url name filename mimetype caption metadata',
      },
      {
        path: 'video',
        select: '_id url name filename mimetype caption metadata',
      },
    ]);
  }

  const resultLean = result?.toObject() as TNews;

  if (resultLean) {
    await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);

    // Create a new version snapshot
    if (update.is_edited) {
      await ArticleVersionService.createVersion(
        id,
        user._id,
        'Automatic snapshot after update',
      );
    }
  }

  return resultLean!;
};

export const updateNews = async (
  user: TJwtPayload,
  id: string,
  payload: Partial<
    Pick<
      TNews,
      | 'writer'
      | 'title'
      | 'sub_title'
      | 'slug'
      | 'description'
      | 'content'
      | 'thumbnail'
      | 'video'
      | 'youtube'
      | 'tags'
      | 'category'
      | 'author'
      | 'status'
      | 'is_featured'
      | 'published_at'
      | 'expired_at'
      | 'categories'
    >
  >,
): Promise<TNews> => {
  const data = await NewsRepository.findOneLean({ _id: id });
  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'News not found');
  }

  const update: Partial<TNews> = { ...payload };

  if (
    Object.keys(payload).includes('slug') ||
    Object.keys(payload).includes('title') ||
    Object.keys(payload).includes('content')
  ) {
    update.is_edited = true;
    update.edited_at = new Date();
    update.editor = user._id as unknown as mongoose.Types.ObjectId;
  }

  const flatten = Flattener.flatten(update, { safe: true });

  const result = await NewsRepository.findByIdAndUpdate(id, flatten);

  if (result) {
    await result.populate([
      { path: 'author', select: '_id name email image' },
      { path: 'category', select: '_id name slug' },
      { path: 'categories', select: '_id name slug' },
      { path: 'event', select: '_id name slug' },
      {
        path: 'thumbnail',
        select: '_id url name filename mimetype caption metadata',
      },
      {
        path: 'video',
        select: '_id url name filename mimetype caption metadata',
      },
    ]);
  }

  const resultLean = result?.toObject() as TNews;

  if (resultLean) {
    await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);

    // Create a new version snapshot
    if (update.is_edited) {
      await ArticleVersionService.createVersion(
        id,
        user._id,
        'Automatic snapshot after admin update',
      );
    }
  }

  if (
    result &&
    result.author &&
    result.author._id &&
    user._id.toString() !== result.author._id.toString() &&
    data.status !== result.status &&
    result.status !== 'pending' &&
    result.status !== 'draft'
  ) {
    await sendNewsNotification({
      news: result._id.toString(),
      sender: user._id.toString(),
      type: 'news-request-response',
    });
  }

  return result!;
};

export const updateSelfBulkNews = async (
  user: TJwtPayload,
  ids: string[],
  payload: Partial<Pick<TNews, 'status'>>,
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const allNews = await NewsRepository.findManyLean({
    _id: { $in: ids },
    author: user._id,
  });
  const foundIds = allNews.map((news) => news._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await NewsRepository.updateMany(
    { _id: { $in: foundIds }, author: user._id },
    { ...payload },
  );

  if (result.modifiedCount > 0) {
    await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
  }

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};

export const updateBulkNews = async (
  ids: string[],
  payload: Partial<Pick<TNews, 'status'>>,
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const allNews = await NewsRepository.findManyLean({ _id: { $in: ids } });
  const foundIds = allNews.map((news) => news._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await NewsRepository.updateMany(
    { _id: { $in: foundIds } },
    { ...payload },
  );

  if (result.modifiedCount > 0) {
    await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
  }

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};

export const deleteSelfNews = async (
  user: TJwtPayload,
  id: string,
): Promise<void> => {
  const news = await NewsRepository.findOne({ _id: id, author: user._id });
  if (!news) {
    throw new AppError(httpStatus.NOT_FOUND, 'News not found');
  }

  await news.softDelete();
  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
};

export const deleteNews = async (id: string): Promise<void> => {
  const news = await NewsRepository.findById(id);
  if (!news) {
    throw new AppError(httpStatus.NOT_FOUND, 'News not found');
  }

  await news.softDelete();
  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
};

export const deleteNewsPermanent = async (id: string): Promise<void> => {
  const news = await NewsRepository.findOneLean({ _id: id }, [], {
    bypassDeleted: true,
  });
  if (!news) {
    throw new AppError(httpStatus.NOT_FOUND, 'News not found');
  }

  // === Relational data cleanup ===
  await Promise.all([
    ArticleVersionModel.deleteMany({ news: id }),
    BookmarkModel.deleteMany({ news: id }),
    CommentModel.deleteMany({ news: id }),
    ReactionModel.deleteMany({ news: id }),
    PollModel.deleteMany({ news: id }),
  ]);

  await NewsRepository.deleteById(id);
};

export const deleteSelfBulkNews = async (
  user: TJwtPayload,
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const allNews = await NewsRepository.findManyLean({
    _id: { $in: ids },
    author: user._id,
  });
  const foundIds = allNews.map((news) => news._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await NewsRepository.updateMany(
    { _id: { $in: foundIds }, author: user._id },
    { is_deleted: true },
  );

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const deleteBulkNews = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const allNews = await NewsRepository.findManyLean({ _id: { $in: ids } });
  const foundIds = allNews.map((news) => news._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));
  await NewsRepository.updateMany(
    { _id: { $in: foundIds } },
    { is_deleted: true },
  );

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const deleteBulkNewsPermanent = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const allNews = await NewsRepository.findManyLean(
    { _id: { $in: ids }, is_deleted: true },
    [],
    { bypassDeleted: true },
  );
  const foundIds = allNews.map((news) => news._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await NewsRepository.deleteMany(
    {
      _id: { $in: foundIds },
      is_deleted: true,
    },
    { bypassDeleted: true },
  );

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const restoreSelfNews = async (
  user: TJwtPayload,
  id: string,
): Promise<TNews> => {
  const news = await NewsRepository.restoreById(id);

  if (!news || news.author.toString() !== user._id.toString()) {
    throw new AppError(httpStatus.NOT_FOUND, 'News not found or not deleted');
  }

  return news.toObject() as TNews;
};

export const restoreNews = async (id: string): Promise<TNews> => {
  const news = await NewsRepository.restoreById(id);

  if (!news) {
    throw new AppError(httpStatus.NOT_FOUND, 'News not found or not deleted');
  }

  return news.toObject() as TNews;
};

export const restoreSelfBulkNews = async (
  user: TJwtPayload,
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const result = await NewsRepository.restoreManyByIds(ids);

  const restoredBulkNews = await NewsRepository.findManyLean({
    _id: { $in: ids },
    author: user._id,
  });
  const restoredIds = restoredBulkNews.map((news) => news._id.toString());
  const notFoundIds = ids.filter((id) => !restoredIds.includes(id));

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};

export const restoreBulkNews = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const result = await NewsRepository.restoreManyByIds(ids);

  const restoredBulkNews = await NewsRepository.findManyLean({
    _id: { $in: ids },
  });
  const restoredIds = restoredBulkNews.map((news) => news._id.toString());
  const notFoundIds = ids.filter((id) => !restoredIds.includes(id));

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};
