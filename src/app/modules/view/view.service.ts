import httpStatus from 'http-status';
import AppError from '../../builder/app-error';
import AppQueryFind from '../../builder/app-query-find';
import { TJwtPayload } from '../../types/jsonwebtoken.type';
import {
  generateCacheKey,
  invalidateCacheByPattern,
  withCache,
} from '../../utils/cache.utils';
import { TGuest } from '../guest/guest.type';
import { View } from './view.model';
import { TView } from './view.type';

const CACHE_PREFIX = 'view';
const CACHE_TTL = 300; // 5 minutes

export const createView = async (
  user: TJwtPayload,
  guest: TGuest,
  payload: TView,
): Promise<TView> => {
  if (!user?._id && !guest?.token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const update = {
    ...payload,
    ...(user?._id ? { user: user._id } : {}),
    ...(guest?.token ? { guest: guest.token } : {}),
  };

  const result = await View.create(update);
  if (result) {
    await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
  }
  return result.toObject();
};

export const getSelfView = async (
  user: TJwtPayload,
  guest: TGuest,
  id: string,
): Promise<TView> => {
  if (!user?._id && !guest?.token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const cacheKey = generateCacheKey(CACHE_PREFIX, [
    'self',
    user?._id || guest?.token,
    id,
  ]);
  return await withCache(cacheKey, CACHE_TTL, async () => {
    const result = await View.findOne({
      _id: id,
      ...(user?._id ? { user: user._id } : { guest: guest.token }),
    }).lean();

    if (!result) {
      throw new AppError(httpStatus.NOT_FOUND, 'View not found');
    }

    return result;
  });
};

export const getView = async (id: string): Promise<TView> => {
  return await withCache(
    generateCacheKey(CACHE_PREFIX, ['id', id]),
    CACHE_TTL,
    async () => {
      const result = await View.findById(id).lean();
      if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'View not found');
      }
      return result;
    },
  );
};

export const getSelfViews = async (
  user: TJwtPayload,
  guest: TGuest,
  query: Record<string, unknown>,
): Promise<{
  data: TView[];
  meta: { total: number; page: number; limit: number };
}> => {
  if (!user?._id && !guest?.token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const viewQuery = new AppQueryFind(View, {
    ...(user?._id ? { user: user._id } : { guest: guest.token }),
    ...query,
  })
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  const result = await viewQuery.execute();
  return result;
};

export const getViews = async (
  query: Record<string, unknown>,
): Promise<{
  data: TView[];
  meta: { total: number; page: number; limit: number };
}> => {
  const viewQuery = new AppQueryFind(View, query)
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  const result = await viewQuery.execute();
  return result;
};

export const getSelfNewsView = async (
  user: TJwtPayload,
  guest: TGuest,
  news_id: string,
): Promise<{ data: TView | null; meta: { views: number } }> => {
  if (!news_id) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found news_id');
  }

  const query = user?._id
    ? { news: news_id, user: user._id }
    : guest?.token
      ? { news: news_id, guest: guest.token }
      : undefined;

  if (query) {
    const isSelfViewed = await View.findOne(query).lean();

    if (!isSelfViewed) {
      const created = await View.create({
        news: news_id,
        ...(user?._id ? { user: user._id } : {}),
        ...(guest?.token ? { guest: guest.token } : {}),
      });
      if (created) {
        await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
      }
    }
  }

  const result = await withCache(
    generateCacheKey(CACHE_PREFIX, ['news', news_id, 'count']),
    60,
    async () => {
      return await View.countDocuments({ news: news_id });
    },
  );

  return { data: null, meta: { views: result } };
};

export const deleteSelfView = async (
  user: TJwtPayload,
  guest: TGuest,
  id: string,
): Promise<void> => {
  if (!user?._id && !guest?.token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  await View.findOneAndDelete({
    _id: id,
    ...(user?._id ? { user: user._id } : { guest: guest.token }),
  });
};

export const deleteView = async (id: string): Promise<void> => {
  const view = await View.findById(id).lean();
  if (!view) {
    throw new AppError(httpStatus.NOT_FOUND, 'View not found');
  }

  await View.findByIdAndDelete(id);
};

export const deleteSelfViews = async (
  user: TJwtPayload,
  guest: TGuest,
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  if (!user?._id && !guest?.token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const views = await View.find({
    _id: { $in: ids },
    ...(user?._id ? { user: user._id } : { guest: guest.token }),
  }).lean();
  const foundIds = views.map((view) => view._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await View.deleteMany(
    {
      _id: { $in: foundIds },
      ...(user?._id ? { user: user._id } : { guest: guest.token }),
    },
    { is_deleted: true },
  );

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const deleteViews = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const views = await View.find({ _id: { $in: ids } }).lean();
  const foundIds = views.map((view) => view._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await View.deleteMany({ _id: { $in: foundIds } });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};
