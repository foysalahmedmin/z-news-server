import httpStatus from 'http-status';
import AppError from '../../builder/app-error';
import AppQueryFind from '../../builder/app-query-find';
import { TJwtPayload } from '../../types/jsonwebtoken.type';
import {
  generateCacheKey,
  invalidateCacheByPattern,
  withCache,
} from '../../utils/cache.utils';
import { NewsBreak } from './news-break.model';
import { TNewsBreak } from './news-break.type';

const CACHE_PREFIX = 'news-break';
const CACHE_TTL = 1800; // 30 minutes

export const createNewsBreak = async (
  user: TJwtPayload,
  payload: TNewsBreak,
): Promise<TNewsBreak> => {
  if (!user?._id) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const result = await NewsBreak.create(payload);
  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
  return result.toObject();
};

export const getSelfNewsBreak = async (
  user: TJwtPayload,
  id: string,
): Promise<TNewsBreak> => {
  return await withCache(
    generateCacheKey(CACHE_PREFIX, ['self', user._id, id]),
    CACHE_TTL,
    async () => {
      const result = await NewsBreak.findById(id).lean();
      if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'News-Break not found');
      }
      return result;
    },
  );
};

export const getNewsBreak = async (id: string): Promise<TNewsBreak> => {
  return await withCache(
    generateCacheKey(CACHE_PREFIX, ['id', id]),
    CACHE_TTL,
    async () => {
      const result = await NewsBreak.findById(id).lean();
      if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'News-Break not found');
      }
      return result;
    },
  );
};

export const getPublicNewsBreaks = async (
  query: Record<string, unknown>,
): Promise<{
  data: TNewsBreak[];
  meta: { total: number; page: number; limit: number };
}> => {
  const cacheKey = generateCacheKey(CACHE_PREFIX, ['public', 'list', query]);
  return await withCache(cacheKey, CACHE_TTL, async () => {
    const { date: q_date, ...rest } = query || {};

    const date = q_date ? new Date(q_date as string) : new Date();

    const filter = {
      published_at: { $lte: date },
      $or: [{ expired_at: { $exists: false } }, { expired_at: { $gte: date } }],
    };

    const NewsQuery = new AppQueryFind(NewsBreak, {
      status: 'published',
      ...filter,
      ...rest,
    })
      .populate([{ path: 'news', select: '_id title slug' }])
      .filter()
      .sort()
      .paginate()
      .fields()
      .tap((q) => q.lean());

    const result = await NewsQuery.execute();
    return result;
  });
};

export const getSelfNewsBreaks = async (
  user: TJwtPayload,
  query: Record<string, unknown>,
): Promise<{
  data: TNewsBreak[];
  meta: { total: number; page: number; limit: number };
}> => {
  const cacheKey = generateCacheKey(CACHE_PREFIX, [
    'self',
    user._id,
    'list',
    query,
  ]);
  return await withCache(cacheKey, CACHE_TTL, async () => {
    const NewsQuery = new AppQueryFind(NewsBreak, query)
      .filter()
      .sort()
      .paginate()
      .fields()
      .tap((q) => q.lean());

    const result = await NewsQuery.execute();
    return result;
  });
};

export const getNewsBreaks = async (
  query: Record<string, unknown>,
): Promise<{
  data: TNewsBreak[];
  meta: { total: number; page: number; limit: number };
}> => {
  const cacheKey = generateCacheKey(CACHE_PREFIX, ['admin', 'list', query]);
  return await withCache(cacheKey, CACHE_TTL, async () => {
    const NewsQuery = new AppQueryFind(NewsBreak, query)
      .filter()
      .sort()
      .paginate()
      .fields()
      .tap((q) => q.lean());

    const result = await NewsQuery.execute();
    return result;
  });
};

export const updateSelfNewsBreak = async (
  _user: TJwtPayload,
  id: string,
  payload: Partial<TNewsBreak>,
): Promise<TNewsBreak> => {
  const data = await NewsBreak.findById(id).lean();
  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'News-Break not found');
  }

  const update: Partial<TNewsBreak> = { ...payload };

  const result = await NewsBreak.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).lean();

  if (result) {
    await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
  }

  return result!;
};

export const updateNewsBreak = async (
  id: string,
  payload: Partial<TNewsBreak>,
): Promise<TNewsBreak> => {
  const data = await NewsBreak.findById(id).lean();
  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'News-Break not found');
  }

  const update: Partial<TNewsBreak> = { ...payload };

  const result = await NewsBreak.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).lean();

  if (result) {
    await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
  }

  return result!;
};

export const updateSelfNewsBreaks = async (
  _user: TJwtPayload,
  ids: string[],
  payload: Partial<Pick<TNewsBreak, 'status'>>,
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const newsBreaks = await NewsBreak.find({
    _id: { $in: ids },
  }).lean();
  const foundIds = newsBreaks.map((newsBreak) => newsBreak._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await NewsBreak.updateMany(
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

export const updateNewsBreaks = async (
  ids: string[],
  payload: Partial<Pick<TNewsBreak, 'status'>>,
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const newsBreaks = await NewsBreak.find({ _id: { $in: ids } }).lean();
  const foundIds = newsBreaks.map((newsBreak) => newsBreak._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await NewsBreak.updateMany(
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

export const deleteSelfNewsBreak = async (
  _user: TJwtPayload,
  id: string,
): Promise<void> => {
  const newsBreak = await NewsBreak.findById(id);
  if (!newsBreak) {
    throw new AppError(httpStatus.NOT_FOUND, 'News-Break not found');
  }

  await newsBreak.softDelete();
  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
};

export const deleteNewsBreak = async (id: string): Promise<void> => {
  const newsBreak = await NewsBreak.findById(id);
  if (!newsBreak) {
    throw new AppError(httpStatus.NOT_FOUND, 'News-Break not found');
  }

  await newsBreak.softDelete();
  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
};

export const deleteNewsBreakPermanent = async (id: string): Promise<void> => {
  const newsBreak = await NewsBreak.findById(id).lean();
  if (!newsBreak) {
    throw new AppError(httpStatus.NOT_FOUND, 'News-Break not found');
  }

  await NewsBreak.findByIdAndDelete(id);
};

export const deleteSelfNewsBreaks = async (
  _user: TJwtPayload,
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const newsBreaks = await NewsBreak.find({
    _id: { $in: ids },
  }).lean();
  const foundIds = newsBreaks.map((newsBreak) => newsBreak._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await NewsBreak.updateMany({ _id: { $in: foundIds } }, { is_deleted: true });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const deleteNewsBreaks = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const newsBreaks = await NewsBreak.find({ _id: { $in: ids } }).lean();
  const foundIds = newsBreaks.map((newsBreak) => newsBreak._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await NewsBreak.updateMany({ _id: { $in: foundIds } }, { is_deleted: true });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const deleteNewsBreaksPermanent = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const newsBreaks = await NewsBreak.find({ _id: { $in: ids } }).lean();
  const foundIds = newsBreaks.map((newsBreak) => newsBreak._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await NewsBreak.deleteMany({ _id: { $in: foundIds } });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const restoreSelfNewsBreak = async (
  _user: TJwtPayload,
  id: string,
): Promise<TNewsBreak> => {
  const newsBreak = await NewsBreak.findOneAndUpdate(
    { _id: id, is_deleted: true },
    { is_deleted: false },
    { new: true },
  ).lean();

  if (!newsBreak) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'News-Break not found or not deleted',
    );
  }

  return newsBreak;
};

export const restoreNewsBreak = async (id: string): Promise<TNewsBreak> => {
  const newsBreak = await NewsBreak.findOneAndUpdate(
    { _id: id, is_deleted: true },
    { is_deleted: false },
    { new: true },
  ).lean();

  if (!newsBreak) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'News-Break not found or not deleted',
    );
  }

  return newsBreak;
};

export const restoreSelfNewsBreaks = async (
  _user: TJwtPayload,
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const result = await NewsBreak.updateMany(
    { _id: { $in: ids }, is_deleted: true },
    { is_deleted: false },
  );

  const restoredNewsBreaks = await NewsBreak.find({
    _id: { $in: ids },
  }).lean();
  const restoredIds = restoredNewsBreaks.map((newsBreak) =>
    newsBreak._id.toString(),
  );
  const notFoundIds = ids.filter((id) => !restoredIds.includes(id));

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};

export const restoreNewsBreaks = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const result = await NewsBreak.updateMany(
    { _id: { $in: ids }, is_deleted: true },
    { is_deleted: false },
  );

  const restoredNewsBreaks = await NewsBreak.find({
    _id: { $in: ids },
  }).lean();
  const restoredIds = restoredNewsBreaks.map((newsBreak) =>
    newsBreak._id.toString(),
  );
  const notFoundIds = ids.filter((id) => !restoredIds.includes(id));

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};
