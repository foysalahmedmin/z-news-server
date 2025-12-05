import httpStatus from 'http-status';
import AppError from '../../builder/app-error';
import AppQueryFind from '../../builder/app-query-find';
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

  const result = await NewsHeadline.create(payload);
  return result.toObject();
};

export const getSelfNewsHeadline = async (
  user: TJwtPayload,
  id: string,
): Promise<TNewsHeadline> => {
  const result = await NewsHeadline.findById(id).lean();
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

export const getPublicNewsHeadlines = async (
  query: Record<string, unknown>,
): Promise<{
  data: TNewsHeadline[];
  meta: { total: number; page: number; limit: number };
}> => {
  const { date: q_date, ...rest } = query || {};

  const date = q_date ? new Date(q_date as string) : new Date();

  const filter = {
    published_at: { $lte: date },
    $or: [{ expired_at: { $exists: false } }, { expired_at: { $gte: date } }],
  };

  const NewsQuery = new AppQueryFind(NewsHeadline, { status: 'published', ...filter, ...rest })
    .populate([
      { path: 'news', select: '_id title slug' },
    ])
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  const result = await NewsQuery.execute();
  return result;
};

export const getSelfNewsHeadlines = async (
  user: TJwtPayload,
  query: Record<string, unknown>,
): Promise<{
  data: TNewsHeadline[];
  meta: { total: number; page: number; limit: number };
}> => {
  const NewsQuery = new AppQueryFind(NewsHeadline, query)
    .populate([
      { path: 'news', select: '_id title slug' },
    ])
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  const result = await NewsQuery.execute();
  return result;
};

export const getNewsHeadlines = async (
  query: Record<string, unknown>,
): Promise<{
  data: TNewsHeadline[];
  meta: { total: number; page: number; limit: number };
}> => {
  const NewsQuery = new AppQueryFind(NewsHeadline, query)
    .populate([
      { path: 'news', select: '_id title slug' },
    ])
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  const result = await NewsQuery.execute();
  return result;
};

export const updateSelfNewsHeadline = async (
  user: TJwtPayload,
  id: string,
  payload: Partial<TNewsHeadline>,
): Promise<TNewsHeadline> => {
  const data = await NewsHeadline.findById(id).lean();
  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'News-Headline not found');
  }

  const update: Partial<TNewsHeadline> = { ...payload };

  const result = await NewsHeadline.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).lean();

  return result!;
};

export const updateNewsHeadline = async (
  id: string,
  payload: Partial<TNewsHeadline>,
): Promise<TNewsHeadline> => {
  const data = await NewsHeadline.findById(id).lean();
  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'News-Headline not found');
  }

  const update: Partial<TNewsHeadline> = { ...payload };

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
  }).lean();
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
  const newsHeadline = await NewsHeadline.findById(id);
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
  }).lean();
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
