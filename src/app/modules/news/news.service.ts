import { Flattener } from 'flattener-kit';
import fs from 'fs';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../builder/AppError';
import AppQuery from '../../builder/AppQuery';
import { TJwtPayload } from '../auth/auth.type';
import { Category } from '../category/category.model';
import { sendNewsNotification } from '../notification/notification.service';
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

export const uploadNewsFile = async (
  file: Express.Multer.File,
  type: 'image' | 'video' | 'audio' | 'file',
  base: string = '',
) => {
  if (!file || !type) return null;

  const path = file.path.replace(/\\/g, '/');
  const short_path = path.split('/').slice(-3).join('/');

  return {
    type: type,
    filename: file.filename,
    short_path: short_path,
    path: path,
    url: `${base}/${path}`,
    size: file.size,
    mimetype: file.mimetype,
  };
};

export const deleteNewsFile = async (path: string) => {
  if (!path) return;
  fs.unlink(path, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.warn(`❌ Failed to delete file: ${path}`, err.message);
    } else {
      console.log(`🗑️ Deleted file: ${path}`);
    }
  });

  return path;
};

// export const createNews = async (
//   user: TJwtPayload,
//   payload: TNews & {
//     is_news_headline?: boolean;
//     is_news_break?: boolean;
//   },
// ): Promise<TNews> => {
//   if (!user?._id) {
//     throw new AppError(httpStatus.NOT_FOUND, 'User not found');
//   }

//   const session = await mongoose.startSession();

//   try {
//     session.startTransaction();

//     const {
//       is_news_headline,
//       is_news_break,
//       news_headline,
//       news_break,
//       ...rest
//     } = payload;

//     const newsData = {
//       ...rest,
//       author: user._id,
//     };

//     const [created_news] = await News.create([newsData], { session });

//     // Create NewsHeadline
//     if (is_news_headline) {
//       await NewsHeadline.create(
//         [
//           {
//             author: user._id,
//             news: created_news._id,
//             title: created_news.title,
//             description: created_news.description || '',
//             tags: created_news.tags || [],
//             category: created_news.category || null,
//             published_at: created_news.published_at || null,
//             expired_at: created_news.expired_at || null,
//           },
//         ],
//         { session },
//       );
//     }

//     // Create NewsBreak
//     if (is_news_break) {
//       await NewsBreak.create(
//         [
//           {
//             author: user._id,
//             news: created_news._id,
//             title: created_news.title,
//             description: created_news.description || '',
//             tags: created_news.tags || [],
//             category: created_news.category || null,
//             published_at: created_news.published_at || null,
//             expired_at: created_news.expired_at || null,
//           },
//         ],
//         { session },
//       );
//     }

//     await session.commitTransaction();
//     session.endSession();

//     return created_news.toObject();
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     throw error;
//   }
// };

export const createNews = async (
  user: TJwtPayload,
  payload: TNews,
): Promise<TNews> => {
  const created_news = await News.create({ ...payload, author: user._id });

  if (created_news && user.role !== 'admin' && user.role !== 'super-admin') {
    await sendNewsNotification({
      news: created_news._id.toString(),
      sender: user?._id.toString(),
      type: 'news-request',
    });
  }

  return created_news.toObject();
};

export const getPublicNews = async (slug: string): Promise<TNews> => {
  const result = await News.findOne({ slug: slug, status: 'published' })
    .populate([
      { path: 'author', select: '_id name email image' },
      { path: 'category', select: '_id name slug' },
      { path: 'categories', select: '_id name slug' },
      { path: 'event', select: '_id name slug' },
      { path: 'thumbnail', select: '_id url name' },
      { path: 'video', select: '_id url name' },
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
      { path: 'view_count' },
      { path: 'like_count' },
      { path: 'dislike_count' },
      { path: 'comment_count' },
      { path: 'author', select: '_id name email image' },
      { path: 'category', select: '_id name slug' },
      { path: 'categories', select: '_id name slug' },
      { path: 'event', select: '_id name slug' },
      { path: 'thumbnail', select: '_id url name' },
      { path: 'video', select: '_id url name' },
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
      { path: 'view_count' },
      { path: 'like_count' },
      { path: 'dislike_count' },
      { path: 'comment_count' },
      { path: 'author', select: '_id name email image' },
      { path: 'category', select: '_id name slug' },
      { path: 'categories', select: '_id name slug' },
      { path: 'event', select: '_id name slug' },
      { path: 'thumbnail', select: '_id url name' },
      { path: 'video', select: '_id url name' },
    ])
    .lean();
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'News not found');
  }
  return result;
};

export const getPublicBulkNews = async (
  query: Record<string, unknown>,
): Promise<{
  data: TNews[];
  meta: { total: number; page: number; limit: number };
}> => {
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

  const NewsQuery = new AppQuery<TNews>(
    News.find().populate([
      { path: 'author', select: '_id name email image' },
      { path: 'category', select: '_id name slug' },
      { path: 'categories', select: '_id name slug' },
      { path: 'event', select: '_id name slug' },
      { path: 'thumbnail', select: '_id url name' },
      { path: 'video', select: '_id url name' },
    ]),
    { status: 'published', ...rest },
  )
    .search(['title', 'description'])
    .filter()
    .sort()
    .paginate()
    .fields([
      'title',
      'sub_title',
      'slug',
      'description',
      'content',
      'thumbnail',
      'video',
      'youtube',
      'author',
      'writer',
      'category',
      'tags',
      'status',
      'layout',
      'published_at',
      'is_featured',
      'views',
    ])
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
  // else {
  //   const end = new Date();

  //   rest.published_at = { $lte: end };
  // }

  const NewsQuery = new AppQuery<TNews>(
    News.find().populate([
      { path: 'author', select: '_id name email image' },
      { path: 'category', select: '_id name slug' },
      { path: 'categories', select: '_id name slug' },
      { path: 'event', select: '_id name slug' },
      { path: 'thumbnail', select: '_id url name' },
      { path: 'video', select: '_id url name' },
    ]),
    { author: user._id, ...rest },
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
      'video',
      'youtube',
      'author',
      'writer',
      'category',
      'tags',
      'status',
      'layout',
      'published_at',
      'is_featured',
      'views',
    ])
    .tap((q) => q.lean());

  const result = await NewsQuery.execute([
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
  ]);
  return result;
};

export const getBulkNews = async (
  query: Record<string, unknown>,
): Promise<{
  data: TNews[];
  meta: { total: number; page: number; limit: number };
}> => {
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
  // else {
  //   const end = new Date();

  //   rest.published_at = { $lte: end };
  // }

  const NewsQuery = new AppQuery<TNews>(
    News.find().populate([
      { path: 'author', select: '_id name email image' },
      { path: 'category', select: '_id name slug' },
      { path: 'categories', select: '_id name slug' },
      { path: 'event', select: '_id name slug' },
      { path: 'thumbnail', select: '_id url name' },
      { path: 'video', select: '_id url name' },
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
      'video',
      'youtube',
      'author',
      'writer',
      'category',
      'tags',
      'status',
      'layout',
      'published_at',
      'is_featured',
      'views',
    ])
    .tap((q) => q.lean());

  const result = await NewsQuery.execute([
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
  ]);
  return result;
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
    >
  >,
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
    update.editor = user._id as any;
  }

  const flatten = Flattener.flatten(update, { safe: true });

  const result = await News.findByIdAndUpdate(id, flatten, {
    new: true,
    runValidators: true,
  })
    .populate([
      { path: 'author', select: '_id name email image' },
      { path: 'category', select: '_id name slug' },
      { path: 'categories', select: '_id name slug' },
      { path: 'event', select: '_id name slug' },
      { path: 'thumbnail', select: '_id url name' },
      { path: 'video', select: '_id url name' },
    ])
    .lean();

  return result!;
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
    >
  >,
): Promise<TNews> => {
  const data = await News.findOne({ _id: id }).lean();
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
    update.editor = user._id as any;
  }

  const flatten = Flattener.flatten(update, { safe: true });

  const result = await News.findByIdAndUpdate(id, flatten, {
    new: true,
    runValidators: true,
  })
    .populate([
      { path: 'author', select: '_id name email image' },
      { path: 'category', select: '_id name slug' },
      { path: 'categories', select: '_id name slug' },
      { path: 'event', select: '_id name slug' },
      { path: 'thumbnail', select: '_id url name' },
      { path: 'video', select: '_id url name' },
    ])
    .lean();

  if (
    result &&
    user._id !== result.author.toString() &&
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
  const news = await News.findById(id)
    .setOptions({ bypassDeleted: true })
    .lean();
  if (!news) {
    throw new AppError(httpStatus.NOT_FOUND, 'News not found');
  }

  // === File cleanup using utility ===

  await News.findByIdAndDelete(id).setOptions({ bypassDeleted: true });
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
  const allNews = await News.find({
    _id: { $in: ids },
    is_deleted: true,
  })
    .setOptions({ bypassDeleted: true })
    .lean();
  const foundIds = allNews.map((news) => news._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await News.deleteMany({
    _id: { $in: foundIds },
    is_deleted: true,
  }).setOptions({ bypassDeleted: true });

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

