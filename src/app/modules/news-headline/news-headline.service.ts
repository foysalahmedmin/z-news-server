import httpStatus from 'http-status';
import { Document } from 'mongoose';
import AppError from '../../builder/AppError';
import AppQuery from '../../builder/AppQuery';
import { TJwtPayload } from '../auth/auth.type';
import { NewsHeadline } from './news-headline.model';
import { TNewsHeadline } from './news-headline.type';

export const createNewsHeadline = async (
  user: TJwtPayload,
  payload: TNewsHeadline,
): Promise<TNewsHeadline> => {
  if (!user?._id) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const update = {
    ...payload,
    author: user._id,
  };

  const result = await NewsHeadline.create(update);
  return result.toObject();
};

export const getSelfNewsHeadline = async (
  user: TJwtPayload,
  id: string,
): Promise<TNewsHeadline> => {
  const result = await NewsHeadline.findOne({
    _id: id,
    author: user._id,
  }).lean();
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'News-Headline not found');
  }
  return result;
};

export const getNewsHeadline = async (id: string): Promise<TNewsHeadline> => {
  const result = await NewsHeadline.findById(id).lean();
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'News-Headline not found');
  }
  return result;
};

export const getSelfNewsHeadlines = async (
  user: TJwtPayload,
  query: Record<string, unknown>,
): Promise<{
  data: TNewsHeadline[];
  meta: { total: number; page: number; limit: number };
}> => {
  const NewsQuery = new AppQuery<Document, TNewsHeadline>(
    NewsHeadline.find({ author: user._id }).lean(),
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

export const getNewsHeadlines = async (
  query: Record<string, unknown>,
): Promise<{
  data: TNewsHeadline[];
  meta: { total: number; page: number; limit: number };
}> => {
  const NewsQuery = new AppQuery<Document, TNewsHeadline>(
    NewsHeadline.find().lean(),
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

export const updateSelfNewsHeadline = async (
  user: TJwtPayload,
  id: string,
  payload: Partial<Pick<TNewsHeadline, 'title' | 'summary'>>,
): Promise<TNewsHeadline> => {
  const data = await NewsHeadline.findOne({ _id: id, author: user._id }).lean();
  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'News-Headline not found');
  }

  const update: Partial<TNewsHeadline> = { ...payload };

  if (Object.keys(payload).includes('content')) {
    update.is_edited = true;
    update.edited_at = new Date();
  }

  const result = await NewsHeadline.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).lean();

  return result!;
};

export const updateNewsHeadline = async (
  id: string,
  payload: Partial<Pick<TNewsHeadline, 'title' | 'summary'>>,
): Promise<TNewsHeadline> => {
  const data = await NewsHeadline.findById(id).lean();
  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'News-Headline not found');
  }

  const update: Partial<TNewsHeadline> = { ...payload };

  if (Object.keys(payload).includes('content')) {
    update.is_edited = true;
    update.edited_at = new Date();
  }

  const result = await NewsHeadline.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).lean();

  return result!;
};

export const updateSelfNewsHeadlines = async (
  user: TJwtPayload,
  ids: string[],
  payload: Partial<Pick<TNewsHeadline, 'status'>>,
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const newsHeadlines = await NewsHeadline.find({
    _id: { $in: ids },
    author: user._id,
  }).lean();
  const foundIds = newsHeadlines.map((newsHeadline) =>
    newsHeadline._id.toString(),
  );
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await NewsHeadline.updateMany(
    { _id: { $in: foundIds }, author: user._id },
    { ...payload },
  );

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};

export const updateNewsHeadlines = async (
  ids: string[],
  payload: Partial<Pick<TNewsHeadline, 'status'>>,
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const newsHeadlines = await NewsHeadline.find({ _id: { $in: ids } }).lean();
  const foundIds = newsHeadlines.map((newsHeadline) =>
    newsHeadline._id.toString(),
  );
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await NewsHeadline.updateMany(
    { _id: { $in: foundIds } },
    { ...payload },
  );

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};

export const deleteSelfNewsHeadline = async (
  user: TJwtPayload,
  id: string,
): Promise<void> => {
  const newsHeadline = await NewsHeadline.findOne({
    _id: id,
    author: user._id,
  });
  if (!newsHeadline) {
    throw new AppError(httpStatus.NOT_FOUND, 'News-Headline not found');
  }

  await newsHeadline.softDelete();
};

export const deleteNewsHeadline = async (id: string): Promise<void> => {
  const newsHeadline = await NewsHeadline.findById(id);
  if (!newsHeadline) {
    throw new AppError(httpStatus.NOT_FOUND, 'News-Headline not found');
  }

  await newsHeadline.softDelete();
};

export const deleteNewsHeadlinePermanent = async (
  id: string,
): Promise<void> => {
  const newsHeadline = await NewsHeadline.findById(id).lean();
  if (!newsHeadline) {
    throw new AppError(httpStatus.NOT_FOUND, 'News-Headline not found');
  }

  await NewsHeadline.findByIdAndDelete(id);
};

export const deleteSelfNewsHeadlines = async (
  user: TJwtPayload,
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const newsHeadlines = await NewsHeadline.find({
    _id: { $in: ids },
    author: user._id,
  }).lean();
  const foundIds = newsHeadlines.map((newsHeadline) =>
    newsHeadline._id.toString(),
  );
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await NewsHeadline.updateMany(
    { _id: { $in: foundIds }, author: user._id },
    { is_deleted: true },
  );

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const deleteNewsHeadlines = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const newsHeadlines = await NewsHeadline.find({ _id: { $in: ids } }).lean();
  const foundIds = newsHeadlines.map((newsHeadline) =>
    newsHeadline._id.toString(),
  );
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await NewsHeadline.updateMany(
    { _id: { $in: foundIds } },
    { is_deleted: true },
  );

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const deleteNewsHeadlinesPermanent = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const newsHeadlines = await NewsHeadline.find({ _id: { $in: ids } }).lean();
  const foundIds = newsHeadlines.map((newsHeadline) =>
    newsHeadline._id.toString(),
  );
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await NewsHeadline.deleteMany({ _id: { $in: foundIds } });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const restoreSelfNewsHeadline = async (
  user: TJwtPayload,
  id: string,
): Promise<TNewsHeadline> => {
  const newsHeadline = await NewsHeadline.findOneAndUpdate(
    { _id: id, is_deleted: true, author: user._id },
    { is_deleted: false },
    { new: true },
  ).lean();

  if (!newsHeadline) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'News-Headline not found or not deleted',
    );
  }

  return newsHeadline;
};

export const restoreNewsHeadline = async (
  id: string,
): Promise<TNewsHeadline> => {
  const newsHeadline = await NewsHeadline.findOneAndUpdate(
    { _id: id, is_deleted: true },
    { is_deleted: false },
    { new: true },
  ).lean();

  if (!newsHeadline) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'News-Headline not found or not deleted',
    );
  }

  return newsHeadline;
};

export const restoreSelfNewsHeadlines = async (
  user: TJwtPayload,
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const result = await NewsHeadline.updateMany(
    { _id: { $in: ids }, is_deleted: true, author: user._id },
    { is_deleted: false },
  );

  const restoredNewsHeadlines = await NewsHeadline.find({
    _id: { $in: ids },
    author: user._id,
  }).lean();
  const restoredIds = restoredNewsHeadlines.map((newsHeadline) =>
    newsHeadline._id.toString(),
  );
  const notFoundIds = ids.filter((id) => !restoredIds.includes(id));

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};

export const restoreNewsHeadlines = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const result = await NewsHeadline.updateMany(
    { _id: { $in: ids }, is_deleted: true },
    { is_deleted: false },
  );

  const restoredNewsHeadlines = await NewsHeadline.find({
    _id: { $in: ids },
  }).lean();
  const restoredIds = restoredNewsHeadlines.map((newsHeadline) =>
    newsHeadline._id.toString(),
  );
  const notFoundIds = ids.filter((id) => !restoredIds.includes(id));

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};
