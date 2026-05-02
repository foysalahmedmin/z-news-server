import httpStatus from 'http-status';
import AppError from '../../builder/app-error';
import { TJwtPayload } from '../../types/jsonwebtoken.type';
import {
  generateCacheKey,
  invalidateCacheByPattern,
  withCache,
} from '../../utils/cache.utils';
import * as NewsHeadlineRepository from './news-headline.repository';
import { TNewsHeadline } from './news-headline.type';

const CACHE_PREFIX = 'news-headline';
const CACHE_TTL = 1800; // 30 minutes

export const createNewsHeadline = async (
  user: TJwtPayload,
  payload: TNewsHeadline,
): Promise<TNewsHeadline> => {
  if (!user?._id) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const result = await NewsHeadlineRepository.create(payload);
  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
  return result;
};

export const getSelfNewsHeadline = async (
  user: TJwtPayload,
  id: string,
): Promise<TNewsHeadline> => {
  return await withCache(
    generateCacheKey(CACHE_PREFIX, ['self', user._id, id]),
    CACHE_TTL,
    async () => {
      const result = await NewsHeadlineRepository.findByIdLean(id);
      if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'News-Headline not found');
      }
      return result;
    },
  );
};

export const getNewsHeadline = async (id: string): Promise<TNewsHeadline> => {
  return await withCache(
    generateCacheKey(CACHE_PREFIX, ['id', id]),
    CACHE_TTL,
    async () => {
      const result = await NewsHeadlineRepository.findByIdLean(id);
      if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'News-Headline not found');
      }
      return result;
    },
  );
};

export const getPublicNewsHeadlines = async (
  query: Record<string, unknown>,
): Promise<{
  data: TNewsHeadline[];
  meta: { total: number; page: number; limit: number };
}> => {
  const cacheKey = generateCacheKey(CACHE_PREFIX, ['public', 'list', query]);
  return await withCache(cacheKey, CACHE_TTL, async () => {
    const { date: q_date, ...rest } = query || {};

    const date = q_date ? new Date(q_date as string) : new Date();

    const filter = {
      published_at: { $lte: date },
      $or: [{ expired_at: { $exists: false } }, { expired_at: { $gte: date } }],
      status: 'published',
    };

    const result = await NewsHeadlineRepository.findPaginated(rest, filter);
    return result;
  });
};

export const getSelfNewsHeadlines = async (
  user: TJwtPayload,
  query: Record<string, unknown>,
): Promise<{
  data: TNewsHeadline[];
  meta: { total: number; page: number; limit: number };
}> => {
  const cacheKey = generateCacheKey(CACHE_PREFIX, [
    'self',
    user._id,
    'list',
    query,
  ]);
  return await withCache(cacheKey, CACHE_TTL, async () => {
    const result = await NewsHeadlineRepository.findPaginated(query);
    return result;
  });
};

export const getNewsHeadlines = async (
  query: Record<string, unknown>,
): Promise<{
  data: TNewsHeadline[];
  meta: { total: number; page: number; limit: number };
}> => {
  const cacheKey = generateCacheKey(CACHE_PREFIX, ['admin', 'list', query]);
  return await withCache(cacheKey, CACHE_TTL, async () => {
    const result = await NewsHeadlineRepository.findPaginated(query);
    return result;
  });
};

export const updateSelfNewsHeadline = async (
  _user: TJwtPayload,
  id: string,
  payload: Partial<TNewsHeadline>,
): Promise<TNewsHeadline> => {
  const result = await NewsHeadlineRepository.updateById(id, payload);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'News-Headline not found');
  }

  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
  return result.toObject();
};

export const updateNewsHeadline = async (
  id: string,
  payload: Partial<TNewsHeadline>,
): Promise<TNewsHeadline> => {
  const result = await NewsHeadlineRepository.updateById(id, payload);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'News-Headline not found');
  }

  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
  return result.toObject();
};

export const updateSelfNewsHeadlines = async (
  _user: TJwtPayload,
  ids: string[],
  payload: Partial<Pick<TNewsHeadline, 'status'>>,
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const newsHeadlines = await NewsHeadlineRepository.findManyByIds(ids);
  const foundIds = newsHeadlines.map((newsHeadline) =>
    newsHeadline._id!.toString(),
  );
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await NewsHeadlineRepository.updateManyByIds(
    foundIds,
    payload,
  );

  if (result.modifiedCount > 0) {
    await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
  }

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
  const newsHeadlines = await NewsHeadlineRepository.findManyByIds(ids);
  const foundIds = newsHeadlines.map((newsHeadline) =>
    newsHeadline._id!.toString(),
  );
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await NewsHeadlineRepository.updateManyByIds(
    foundIds,
    payload,
  );

  if (result.modifiedCount > 0) {
    await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
  }

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};

export const deleteSelfNewsHeadline = async (
  _user: TJwtPayload,
  id: string,
): Promise<void> => {
  const newsHeadline = await NewsHeadlineRepository.findById(id);
  if (!newsHeadline) {
    throw new AppError(httpStatus.NOT_FOUND, 'News-Headline not found');
  }

  await newsHeadline.softDelete();
  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
};

export const deleteNewsHeadline = async (id: string): Promise<void> => {
  const newsHeadline = await NewsHeadlineRepository.findById(id);
  if (!newsHeadline) {
    throw new AppError(httpStatus.NOT_FOUND, 'News-Headline not found');
  }

  await newsHeadline.softDelete();
  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
};

export const deleteNewsHeadlinePermanent = async (
  id: string,
): Promise<void> => {
  const newsHeadline = await NewsHeadlineRepository.findByIdLean(id);
  if (!newsHeadline) {
    throw new AppError(httpStatus.NOT_FOUND, 'News-Headline not found');
  }

  await NewsHeadlineRepository.hardDeleteById(id);
};

export const deleteSelfNewsHeadlines = async (
  _user: TJwtPayload,
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const newsHeadlines = await NewsHeadlineRepository.findManyByIds(ids);
  const foundIds = newsHeadlines.map((newsHeadline) =>
    newsHeadline._id!.toString(),
  );
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await NewsHeadlineRepository.softDeleteManyByIds(foundIds);

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
  const newsHeadlines = await NewsHeadlineRepository.findManyByIds(ids);
  const foundIds = newsHeadlines.map((newsHeadline) =>
    newsHeadline._id!.toString(),
  );
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await NewsHeadlineRepository.softDeleteManyByIds(foundIds);

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
  const newsHeadlines = await NewsHeadlineRepository.findManyByIds(ids);
  const foundIds = newsHeadlines.map((newsHeadline) =>
    newsHeadline._id!.toString(),
  );
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await NewsHeadlineRepository.hardDeleteManyByIds(foundIds);

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const restoreSelfNewsHeadline = async (
  _user: TJwtPayload,
  id: string,
): Promise<TNewsHeadline> => {
  const newsHeadline = await NewsHeadlineRepository.restoreById(id);
  if (!newsHeadline) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'News-Headline not found or not deleted',
    );
  }

  return newsHeadline.toObject();
};

export const restoreNewsHeadline = async (
  id: string,
): Promise<TNewsHeadline> => {
  const newsHeadline = await NewsHeadlineRepository.restoreById(id);
  if (!newsHeadline) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'News-Headline not found or not deleted',
    );
  }

  return newsHeadline.toObject();
};

export const restoreSelfNewsHeadlines = async (
  _user: TJwtPayload,
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const result = await NewsHeadlineRepository.restoreManyByIds(ids);

  const restoredNewsHeadlines = await NewsHeadlineRepository.findManyByIds(ids);
  const restoredIds = restoredNewsHeadlines.map((newsHeadline) =>
    newsHeadline._id!.toString(),
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
  const result = await NewsHeadlineRepository.restoreManyByIds(ids);

  const restoredNewsHeadlines = await NewsHeadlineRepository.findManyByIds(ids);
  const restoredIds = restoredNewsHeadlines.map((newsHeadline) =>
    newsHeadline._id!.toString(),
  );
  const notFoundIds = ids.filter((id) => !restoredIds.includes(id));

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};
