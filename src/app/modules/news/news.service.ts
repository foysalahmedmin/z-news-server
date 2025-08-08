import { Flattener } from 'flattener-kit';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../builder/AppError';
import AppQuery from '../../builder/AppQuery';
import { TGuest } from '../../types/express-session.type';
import { TJwtPayload } from '../auth/auth.type';
import { Category } from '../category/category.model';
import { Comment } from '../comment/comment.model';
import { TComment } from '../comment/comment.type';
import { NewsBreak } from '../news-break/news-break.model';
import { TNewsBreak } from '../news-break/news-break.type';
import { NewsHeadline } from '../news-headline/news-headline.model';
import { TNewsHeadline } from '../news-headline/news-headline.type';
import { News } from './news.model';
import { TNews } from './news.type';

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

export const createNews = async (
  user: TJwtPayload,
  payload: TNews & {
    news_headline?: TNewsHeadline;
    news_break?: TNewsBreak;
  },
): Promise<TNews> => {
  if (!user?._id) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { news_headline, news_break, ...rest } = payload;

    const newsData = {
      ...rest,
      author: user._id,
    };

    const [created_news] = await News.create([newsData], { session });

    // Create NewsHeadline
    if (news_headline?.title) {
      const {
        sequence,
        title,
        description,
        tags,
        category,
        published_at,
        expired_at,
      } = news_headline;

      await NewsHeadline.create(
        [
          {
            sequence,
            author: user._id,
            news: created_news._id,
            title: title || created_news.title,
            description: description || created_news.description,
            tags: tags || created_news.tags,
            category: category || created_news.category,
            published_at: published_at || created_news.published_at,
            expired_at: expired_at || created_news.expired_at,
          },
        ],
        { session },
      );
    }

    // Create NewsBreak
    if (news_break?.title) {
      const {
        sequence,
        title,
        description,
        tags,
        category,
        published_at,
        expired_at,
      } = news_break;

      await NewsBreak.create(
        [
          {
            sequence,
            author: user._id,
            news: created_news._id,
            title: title || created_news.title,
            description: description || created_news.description,
            tags: tags || created_news.tags,
            category: category || created_news.category,
            published_at: published_at || created_news.published_at,
            expired_at: expired_at || created_news.expired_at,
          },
        ],
        { session },
      );
    }

    await session.commitTransaction();
    session.endSession();

    return created_news.toObject();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const getNewsCommentsPublic = async (
  id: string,
  query: {
    page?: number;
    limit?: number;
  },
  guest: TGuest,
): Promise<{
  data: TComment[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
  guest: TGuest;
}> => {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 10);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Comment.find({ news: new mongoose.Types.ObjectId(id) })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Comment.countDocuments({ news: new mongoose.Types.ObjectId(id) }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
    },
    guest,
  };
};

export const getNewsPublic = async (slug: string): Promise<TNews> => {
  const result = await News.findOne({ slug: slug, status: 'published' })
    .populate([
      { path: 'like_count' },
      { path: 'dislike_count' },
      { path: 'comment_count' },
      { path: 'author', select: '_id name email' },
      { path: 'category', select: '_id name slug' },
    ])
    .lean();
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'News not found');
  }
  return result;
};

export const getSelfNews = async (
  user: TJwtPayload,
  id: string,
): Promise<TNews> => {
  const result = await News.findOne({ _id: id, author: user._id })
    .populate([
      { path: 'like_count' },
      { path: 'dislike_count' },
      { path: 'comment_count' },
      { path: 'author', select: '_id name email' },
      { path: 'category', select: '_id name slug' },
      {
        path: 'news_headline',
        select: '_id title published_at expired_at status',
      },
      {
        path: 'news_break',
        select: '_id title published_at expired_at status',
      },
    ])
    .lean();
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'News not found');
  }
  return result;
};

export const getNews = async (id: string): Promise<TNews> => {
  const result = await News.findById(id)
    .populate([
      { path: 'like_count' },
      { path: 'dislike_count' },
      { path: 'comment_count' },
      { path: 'author', select: '_id name email' },
      { path: 'category', select: '_id name slug' },
      {
        path: 'news_headline',
        select: '_id title published_at expired_at status',
      },
      {
        path: 'news_break',
        select: '_id title published_at expired_at status',
      },
    ])
    .lean();
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'News not found');
  }
  return result;
};

export const getBulkNewsPublic = async (
  query: Record<string, unknown>,
): Promise<{
  data: TNews[];
  meta: { total: number; page: number; limit: number };
}> => {
  const {
    category: q_category,
    category_slug: q_category_slug,
    published_at: q_published_at,
    published_at_start: q_published_at_start,
    published_at_end: q_published_at_end,
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
  } else if (q_published_at_start || q_published_at_end) {
    const filter: Record<string, Date> = {};

    if (q_published_at_start) {
      const start = new Date(q_published_at_start as string);
      start.setHours(0, 0, 0, 0);
      filter.$gte = start;
    }

    if (q_published_at_end) {
      const end = new Date(q_published_at_end as string);
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

  const NewsQuery = new AppQuery<TNews>(
    News.find({ status: 'published' }).populate([
      { path: 'author', select: '_id name email' },
      { path: 'category', select: '_id name slug' },
    ]),
    rest,
  )
    .search(['title', 'description'])
    .filter()
    .sort()
    .paginate()
    .fields([
      'title',
      'slug',
      'description',
      'content',
      'thumbnail',
      'author',
      'category',
      'tags',
      'sequence',
      'status',
      'published_at',
    ])
    .fields()
    .tap((q) => q.lean());

  const result = await NewsQuery.execute();
  return result;
};

export const getSelfBulkNews = async (
  user: TJwtPayload,
  query: Record<string, unknown>,
): Promise<{
  data: TNews[];
  meta: { total: number; page: number; limit: number };
}> => {
  const NewsQuery = new AppQuery<TNews>(
    News.find({ author: user._id }).populate([
      { path: 'like_count' },
      { path: 'dislike_count' },
      { path: 'comment_count' },
      { path: 'author', select: '_id name email' },
      { path: 'category', select: '_id name slug' },
      {
        path: 'news_headline',
        select: '_id title published_at expired_at status',
      },
      {
        path: 'news_break',
        select: '_id title published_at expired_at status',
      },
    ]),
    query,
  )
    .search(['title', 'description', 'content'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  const result = await NewsQuery.execute();
  return result;
};

export const getBulkNews = async (
  query: Record<string, unknown>,
): Promise<{
  data: TNews[];
  meta: { total: number; page: number; limit: number };
}> => {
  const NewsQuery = new AppQuery<TNews>(
    News.find().populate([
      { path: 'like_count' },
      { path: 'dislike_count' },
      { path: 'comment_count' },
      { path: 'author', select: '_id name email' },
      { path: 'category', select: '_id name slug' },
      {
        path: 'news_headline',
        select: '_id title published_at expired_at status',
      },
      {
        path: 'news_break',
        select: '_id title published_at expired_at status',
      },
    ]),
    query,
  )
    .search(['title', 'description', 'content'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  const result = await NewsQuery.execute();
  return result;
};

export const updateSelfNews = async (
  user: TJwtPayload,
  id: string,
  payload: Partial<Pick<TNews, 'title' | 'description' | 'content'>>,
): Promise<TNews> => {
  const data = await News.findOne({ _id: id, author: user._id }).lean();
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
  }

  const flatten = Flattener.flatten(update);

  const result = await News.findByIdAndUpdate(id, flatten, {
    new: true,
    runValidators: true,
  }).lean();

  return result!;
};

export const updateNews = async (
  id: string,
  payload: Partial<Pick<TNews, 'title' | 'description' | 'content'>>,
): Promise<TNews> => {
  const data = await News.findById(id).lean();
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
  }

  const flatten = Flattener.flatten(update);

  const result = await News.findByIdAndUpdate(id, flatten, {
    new: true,
    runValidators: true,
  }).lean();

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
  const allNews = await News.find({
    _id: { $in: ids },
    author: user._id,
  }).lean();
  const foundIds = allNews.map((news) => news._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await News.updateMany(
    { _id: { $in: foundIds }, author: user._id },
    { ...payload },
  );

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
  const allNews = await News.find({ _id: { $in: ids } }).lean();
  const foundIds = allNews.map((news) => news._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await News.updateMany(
    { _id: { $in: foundIds } },
    { ...payload },
  );

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};

export const deleteSelfNews = async (
  user: TJwtPayload,
  id: string,
): Promise<void> => {
  const news = await News.findOne({ _id: id, author: user._id });
  if (!news) {
    throw new AppError(httpStatus.NOT_FOUND, 'News not found');
  }

  await news.softDelete();
};

export const deleteNews = async (id: string): Promise<void> => {
  const news = await News.findById(id);
  if (!news) {
    throw new AppError(httpStatus.NOT_FOUND, 'News not found');
  }

  await news.softDelete();
};

export const deleteNewsPermanent = async (id: string): Promise<void> => {
  const news = await News.findById(id).lean();
  if (!news) {
    throw new AppError(httpStatus.NOT_FOUND, 'News not found');
  }

  await News.findByIdAndDelete(id);
};

export const deleteSelfBulkNews = async (
  user: TJwtPayload,
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const allNews = await News.find({
    _id: { $in: ids },
    author: user._id,
  }).lean();
  const foundIds = allNews.map((news) => news._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await News.updateMany(
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
  const allNews = await News.find({ _id: { $in: ids } }).lean();
  const foundIds = allNews.map((news) => news._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await News.updateMany({ _id: { $in: foundIds } }, { is_deleted: true });

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
  const allNews = await News.find({ _id: { $in: ids } }).lean();
  const foundIds = allNews.map((news) => news._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await News.deleteMany({ _id: { $in: foundIds } });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const restoreSelfNews = async (
  user: TJwtPayload,
  id: string,
): Promise<TNews> => {
  const news = await News.findOneAndUpdate(
    { _id: id, is_deleted: true, author: user._id },
    { is_deleted: false },
    { new: true },
  ).lean();

  if (!news) {
    throw new AppError(httpStatus.NOT_FOUND, 'News not found or not deleted');
  }

  return news;
};

export const restoreNews = async (id: string): Promise<TNews> => {
  const news = await News.findOneAndUpdate(
    { _id: id, is_deleted: true },
    { is_deleted: false },
    { new: true },
  ).lean();

  if (!news) {
    throw new AppError(httpStatus.NOT_FOUND, 'News not found or not deleted');
  }

  return news;
};

export const restoreSelfBulkNews = async (
  user: TJwtPayload,
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const result = await News.updateMany(
    { _id: { $in: ids }, is_deleted: true, author: user._id },
    { is_deleted: false },
  );

  const restoredBulkNews = await News.find({
    _id: { $in: ids },
    author: user._id,
  }).lean();
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
  const result = await News.updateMany(
    { _id: { $in: ids }, is_deleted: true },
    { is_deleted: false },
  );

  const restoredBulkNews = await News.find({ _id: { $in: ids } }).lean();
  const restoredIds = restoredBulkNews.map((news) => news._id.toString());
  const notFoundIds = ids.filter((id) => !restoredIds.includes(id));

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};
