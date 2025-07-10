import httpStatus from 'http-status';
import { Document } from 'mongoose';
import AppError from '../../builder/AppError';
import AppQuery from '../../builder/AppQuery';
import { TJwtPayload } from '../auth/auth.type';
import { News } from './news.model';
import { TNews } from './news.type';

export const createNews = async (
  user: TJwtPayload,
  payload: TNews,
): Promise<TNews> => {
  if (!user?._id) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const update = {
    ...payload,
    author: user._id,
  };

  const result = await News.create(update);
  return result.toObject();
};

export const getSelfNews = async (
  user: TJwtPayload,
  id: string,
): Promise<TNews> => {
  const result = await News.findOne({ _id: id, author: user._id }).lean();
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'News not found');
  }
  return result;
};

export const getNews = async (id: string): Promise<TNews> => {
  const result = await News.findById(id).lean();
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'News not found');
  }
  return result;
};

export const getSelfBulkNews = async (
  user: TJwtPayload,
  query: Record<string, unknown>,
): Promise<{
  data: TNews[];
  meta: { total: number; page: number; limit: number };
}> => {
  const NewsQuery = new AppQuery<Document, TNews>(
    News.find({ author: user._id }).lean(),
    query,
  )
    .search(['title', 'summary', 'content'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await NewsQuery.execute();
  return result;
};

export const getBulkNews = async (
  query: Record<string, unknown>,
): Promise<{
  data: TNews[];
  meta: { total: number; page: number; limit: number };
}> => {
  const NewsQuery = new AppQuery<Document, TNews>(News.find().lean(), query)
    .search(['title', 'summary', 'content'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await NewsQuery.execute();
  return result;
};

export const updateSelfNews = async (
  user: TJwtPayload,
  id: string,
  payload: Partial<Pick<TNews, 'title' | 'summary' | 'content'>>,
): Promise<TNews> => {
  const data = await News.findOne({ _id: id, author: user._id }).lean();
  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'News not found');
  }

  const update: Partial<TNews> = { ...payload };

  if (Object.keys(payload).includes('content')) {
    update.is_edited = true;
    update.edited_at = new Date();
  }

  const result = await News.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).lean();

  return result!;
};

export const updateNews = async (
  id: string,
  payload: Partial<Pick<TNews, 'title' | 'summary' | 'content'>>,
): Promise<TNews> => {
  const data = await News.findById(id).lean();
  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'News not found');
  }

  const update: Partial<TNews> = { ...payload };

  if (Object.keys(payload).includes('content')) {
    update.is_edited = true;
    update.edited_at = new Date();
  }

  const result = await News.findByIdAndUpdate(id, update, {
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
  const all_news = await News.find({
    _id: { $in: ids },
    author: user._id,
  }).lean();
  const foundIds = all_news.map((news) => news._id.toString());
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
  const all_news = await News.find({ _id: { $in: ids } }).lean();
  const foundIds = all_news.map((news) => news._id.toString());
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
  const all_news = await News.find({
    _id: { $in: ids },
    author: user._id,
  }).lean();
  const foundIds = all_news.map((news) => news._id.toString());
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
  const all_news = await News.find({ _id: { $in: ids } }).lean();
  const foundIds = all_news.map((news) => news._id.toString());
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
  const all_news = await News.find({ _id: { $in: ids } }).lean();
  const foundIds = all_news.map((news) => news._id.toString());
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
