import httpStatus from 'http-status';
import { Types } from 'mongoose';
import AppError from '../../builder/app-error';
import { TJwtPayload } from '../../types/jsonwebtoken.type';
import {
  generateCacheKey,
  invalidateCacheByPattern,
  withCache,
} from '../../utils/cache.utils';
import { TGuest } from '../guest/guest.type';
import * as UserProfileRepository from '../user-profile/user-profile.repository';
import { UserProfileService } from '../user-profile/user-profile.service';
import { BadgeService } from '../badge/badge.service';
import * as ViewRepository from './view.repository';
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

  const update: Partial<TView> = {
    ...payload,
    ...(user?._id ? { user: user._id as unknown as Types.ObjectId } : {}),
    ...(guest?.token ? { guest: guest.token } : {}),
  };

  const result = await ViewRepository.create(update);
  if (result) {
    await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
  }
  return result.toObject() as TView;
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
    const result = await ViewRepository.findOneLean({
      _id: id,
      ...(user?._id ? { user: user._id } : { guest: guest.token }),
    });

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
      const result = await ViewRepository.findByIdLean(id);
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

  const result = await ViewRepository.findPaginated(
    {
      ...(user?._id ? { user: user._id } : { guest: guest.token }),
    },
    query,
  );

  return result;
};

export const getViews = async (
  query: Record<string, unknown>,
): Promise<{
  data: TView[];
  meta: { total: number; page: number; limit: number };
}> => {
  const result = await ViewRepository.findPaginated({}, query);
  return result;
};

export const getSelfNewsView = async (
  user: TJwtPayload,
  guest: TGuest,
  news_id: string,
): Promise<{ data: TView | null; meta: { views: number } }> => {
  if (!news_id) {
    throw new AppError(httpStatus.NOT_FOUND, 'News ID is required');
  }

  const query = user?._id
    ? { news: news_id, user: user._id }
    : guest?.token
      ? { news: news_id, guest: guest.token }
      : undefined;

  if (query) {
    const isSelfViewed = await ViewRepository.findOneLean(query);

    if (!isSelfViewed) {
      const created = await ViewRepository.create({
        news: news_id as unknown as Types.ObjectId,
        ...(user?._id ? { user: user._id as unknown as Types.ObjectId } : {}),
        ...(guest?.token ? { guest: guest.token } : {}),
      });
      if (created) {
        await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);

        // Update user activity stats and streak
        if (user?._id) {
          await UserProfileService.updateReadingStreak(user._id);
          await UserProfileRepository.incrementActivityStat(
            user._id,
            'articles_read',
          );
          BadgeService.checkAndAwardBadges(user._id).catch(
            // eslint-disable-next-line no-console
            (err) => console.error('Badge check error:', err),
          );
        }
      }
    }
  }

  const result = await withCache(
    generateCacheKey(CACHE_PREFIX, ['news', news_id, 'count']),
    60,
    async () => {
      return await ViewRepository.count({ news: news_id });
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

  await ViewRepository.findOneAndDelete({
    _id: id,
    ...(user?._id ? { user: user._id } : { guest: guest.token }),
  });
};

export const deleteView = async (id: string): Promise<void> => {
  const view = await ViewRepository.findByIdLean(id);
  if (!view) {
    throw new AppError(httpStatus.NOT_FOUND, 'View not found');
  }

  await ViewRepository.deleteById(id);
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

  const views = await ViewRepository.findManyLean({
    _id: { $in: ids },
    ...(user?._id ? { user: user._id } : { guest: guest.token }),
  });
  const foundIds = views.map((view) => view?._id!.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await ViewRepository.deleteMany({
    _id: { $in: foundIds },
    ...(user?._id ? { user: user._id } : { guest: guest.token }),
  });

  return {
    count: result.deletedCount,
    not_found_ids: notFoundIds,
  };
};

export const deleteViews = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const views = await ViewRepository.findManyLean({ _id: { $in: ids } });
  const foundIds = views.map((view) => view._id!.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await ViewRepository.deleteMany({ _id: { $in: foundIds } });

  return {
    count: result.deletedCount,
    not_found_ids: notFoundIds,
  };
};

export const getTopViewedNews = async (
  limit: number = 10,
): Promise<
  {
    _id: string;
    title: string;
    slug: string;
    status: string;
    view_count: number;
  }[]
> => {
  return await View.aggregate([
    { $group: { _id: '$news', view_count: { $sum: 1 } } },
    { $sort: { view_count: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'news',
        localField: '_id',
        foreignField: '_id',
        as: 'news',
      },
    },
    { $unwind: '$news' },
    {
      $project: {
        _id: '$news._id',
        title: '$news.title',
        slug: '$news.slug',
        status: '$news.status',
        view_count: 1,
      },
    },
  ]);
};

export const getViewTrends = async (
  days: number = 7,
): Promise<{ date: string; count: number }[]> => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return await View.aggregate([
    { $match: { created_at: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: '$_id', count: 1 } },
  ]);
};

export const getTotalViewCount = async (): Promise<{ total: number }> => {
  const total = await View.countDocuments();
  return { total };
};
