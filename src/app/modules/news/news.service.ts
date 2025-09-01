import { Flattener } from 'flattener-kit';
import fs from 'fs';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../builder/AppError';
import AppQuery from '../../builder/AppQuery';
import { deleteFiles } from '../../utils/deleteFiles';
import { TJwtPayload } from '../auth/auth.type';
import { Category } from '../category/category.model';
import { sendNewsNotification } from '../notification/notification.service';
import { News } from './news.model';
import { TNews, TNewsDocument } from './news.type';

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
  payload: TNews & {
    is_news_headline?: boolean;
    is_news_break?: boolean;
  },
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

export const getFeaturedPublicNews = async (
  query: Record<string, unknown>,
): Promise<(TNewsDocument | null)[]> => {
  const { date: q_date } = query;

  const baseQuery: Record<string, unknown> = {
    status: 'published',
    is_featured: true,
    is_deleted: false,
  };

  if (q_date) {
    const end = new Date(q_date as string);
    end.setHours(23, 59, 59, 999);

    baseQuery.published_at = { $lte: end };
  } else {
    const end = new Date();

    baseQuery.published_at = { $lte: end };
  }

  const results = await News.aggregate<{
    seq1: TNewsDocument[];
    seq2: TNewsDocument[];
    seq3: TNewsDocument[];
    seq4: TNewsDocument[];
    seq5: TNewsDocument[];
    seq6: TNewsDocument[];
    seq7: TNewsDocument[];
    seq8: TNewsDocument[];
  }>([
    {
      $match: {
        ...baseQuery,
      },
    },
    {
      $facet: {
        seq1: [
          { $match: { sequence: 1 } },
          { $sort: { published_at: -1 } },
          { $limit: 1 },
        ],
        seq2: [
          { $match: { sequence: 2 } },
          { $sort: { published_at: -1 } },
          { $limit: 1 },
        ],
        seq3: [
          { $match: { sequence: 3 } },
          { $sort: { published_at: -1 } },
          { $limit: 1 },
        ],
        seq4: [
          { $match: { sequence: 4 } },
          { $sort: { published_at: -1 } },
          { $limit: 1 },
        ],
        seq5: [
          { $match: { sequence: 5 } },
          { $sort: { published_at: -1 } },
          { $limit: 1 },
        ],
        seq6: [
          { $match: { sequence: 6 } },
          { $sort: { published_at: -1 } },
          { $limit: 1 },
        ],
        seq7: [
          { $match: { sequence: 7 } },
          { $sort: { published_at: -1 } },
          { $limit: 1 },
        ],
        seq8: [
          { $match: { sequence: 8 } },
          { $sort: { published_at: -1 } },
          { $limit: 1 },
        ],
      },
    },
  ]);

  // facet result সর্বদা array দেয় → [ { seq1: [...], seq2: [...], ... } ]
  const data = results[0];

  return [
    data.seq1[0] || null,
    data.seq2[0] || null,
    data.seq3[0] || null,
    data.seq4[0] || null,
    data.seq5[0] || null,
    data.seq6[0] || null,
    data.seq7[0] || null,
  ];
};

export const getPublicNews = async (slug: string): Promise<TNews> => {
  const result = await News.findOneAndUpdate(
    { slug: slug, status: 'published' },
    { $inc: { views: 1 } },
    { new: true },
  )
    .populate([
      { path: 'author', select: '_id name email image' },
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
      { path: 'author', select: '_id name email image' },
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
      { path: 'author', select: '_id name email image' },
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

  const NewsQuery = new AppQuery<TNews>(
    News.find({ status: 'published' }).populate([
      { path: 'author', select: '_id name email image' },
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
      'is_featured',
      'is_news_headline',
      'is_news_break',
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
    News.find({ author: user._id }).populate([
      { path: 'author', select: '_id name email image' },
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
      'is_featured',
      'is_news_headline',
      'is_news_break',
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
      'writer',
      'category',
      'tags',
      'sequence',
      'status',
      'published_at',
      'is_featured',
      'is_news_headline',
      'is_news_break',
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
      | 'description'
      | 'content'
      | 'caption'
      | 'thumbnail'
      | 'images'
      | 'youtube'
      | 'caption'
      | 'seo'
      | 'tags'
      | 'category'
      | 'author'
      | 'status'
      | 'is_featured'
      | 'is_premium'
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

  // === File cleanup using utility ===
  if (payload?.thumbnail !== data.thumbnail && data.thumbnail) {
    deleteFiles(data.thumbnail, 'news/images');
    update.thumbnail = payload.thumbnail || '';
  }

  if (payload.seo?.image !== data.seo?.image && data.seo?.image) {
    deleteFiles(data.seo.image, 'news/seo/images');

    const seo = update.seo ?? (update.seo = {});
    seo.image = payload.seo?.image || '';
  }

  if (data.images?.length) {
    const oldImages = data.images || [];
    const newImages = payload.images || [];

    const imagesToDelete = oldImages.filter(
      (oldImage) => !newImages.includes(oldImage),
    );

    if (imagesToDelete.length > 0) {
      deleteFiles(imagesToDelete, 'news/images');
    }
  }

  const flatten = Flattener.flatten(update, { safe: true });

  const result = await News.findByIdAndUpdate(id, flatten, {
    new: true,
    runValidators: true,
  }).lean();

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
      | 'description'
      | 'content'
      | 'caption'
      | 'thumbnail'
      | 'images'
      | 'youtube'
      | 'caption'
      | 'seo'
      | 'tags'
      | 'category'
      | 'author'
      | 'status'
      | 'is_featured'
      | 'is_premium'
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

  // === File cleanup using utility ===
  if (payload?.thumbnail !== data.thumbnail && data.thumbnail) {
    deleteFiles(data.thumbnail, 'news/images');
    update.thumbnail = payload.thumbnail || '';
  }

  if (payload.seo?.image !== data.seo?.image && data.seo?.image) {
    deleteFiles(data.seo.image, 'news/seo/images');

    const seo = update.seo ?? (update.seo = {});
    seo.image = payload.seo?.image || '';
  }

  if (data.images?.length) {
    const oldImages = data.images || [];
    const newImages = payload.images || [];

    const imagesToDelete = oldImages.filter(
      (oldImage) => !newImages.includes(oldImage),
    );

    if (imagesToDelete.length > 0) {
      deleteFiles(imagesToDelete, 'news/images');
    }
  }

  const flatten = Flattener.flatten(update, { safe: true });

  const result = await News.findByIdAndUpdate(id, flatten, {
    new: true,
    runValidators: true,
  }).lean();

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
  const news = await News.findById(id).lean();
  if (!news) {
    throw new AppError(httpStatus.NOT_FOUND, 'News not found');
  }

  // === File cleanup using utility ===
  deleteFiles(news?.thumbnail, 'news/images');
  deleteFiles(news?.images, 'news/images');
  deleteFiles(news?.seo?.image, 'news/seo/images');

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
