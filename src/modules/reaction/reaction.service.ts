/**
 * Reaction Service
 *
 * Contains ONLY business logic. All database access is delegated to
 * `reaction.repository.ts`. This makes the service independently
 * unit-testable by mocking the repository.
 */

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
import * as ReactionRepository from './reaction.repository';
import { TReaction } from './reaction.type';

const CACHE_PREFIX = 'reaction';
const CACHE_TTL = 300; // 5 minutes

const DEFAULT_POPULATE = [
  { path: 'user', select: '_id name email image' },
  { path: 'news', select: '_id slug title thumbnail' },
];

export const createReaction = async (
  user: TJwtPayload,
  guest: TGuest,
  payload: TReaction,
): Promise<TReaction> => {
  if (!user?._id && !guest?.token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const update: Partial<TReaction> = {
    ...payload,
    ...(user?._id ? { user: user._id as unknown as Types.ObjectId } : {}),
    ...(guest?.token ? { guest: guest.token } : {}),
  };

  const result = await ReactionRepository.create(update);
  if (result) {
    await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
    // Also invalidate news cache because reaction counts might be cached there or used by news
    await invalidateCacheByPattern(`news:*`);

    // Update user activity stats
    if (user?._id) {
      await UserProfileRepository.incrementActivityStat(
        user._id,
        'total_reactions',
      );
    }
  }
  return result.toObject();
};

export const getSelfNewsReaction = async (
  user: TJwtPayload,
  guest: TGuest,
  news_id: string,
): Promise<{
  data: TReaction | null;
  meta: { likes: number; dislikes: number };
  guest: TGuest;
}> => {
  if (!news_id) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found news_id');
  }

  const cacheKey = generateCacheKey(CACHE_PREFIX, [
    'news',
    news_id,
    'self',
    user?._id || guest?.token,
  ]);
  return await withCache(cacheKey, CACHE_TTL, async () => {
    const query = user?._id
      ? { news: news_id, user: user._id }
      : guest?.token
        ? { news: news_id, guest: guest.token }
        : null;

    const [data, likes, dislikes] = await Promise.all([
      query ? ReactionRepository.findOneLean(query) : Promise.resolve(null),
      ReactionRepository.count({ news: news_id, type: 'like' }),
      ReactionRepository.count({ news: news_id, type: 'dislike' }),
    ]);

    return { data, meta: { likes, dislikes }, guest };
  });
};

export const getSelfReaction = async (
  user: TJwtPayload,
  guest: TGuest,
  id: string,
): Promise<TReaction> => {
  if (!user?._id && !guest?.token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const cacheKey = generateCacheKey(CACHE_PREFIX, [
    'self',
    user?._id || guest?.token,
    id,
  ]);
  return await withCache(cacheKey, CACHE_TTL, async () => {
    const result = await ReactionRepository.findOneLean(
      {
        _id: id,
        ...(user?._id ? { user: user._id } : { guest: guest.token }),
      },
      DEFAULT_POPULATE,
    );

    if (!result) {
      throw new AppError(httpStatus.NOT_FOUND, 'Reaction not found');
    }

    return result;
  });
};

export const getReaction = async (id: string): Promise<TReaction> => {
  return await withCache(
    generateCacheKey(CACHE_PREFIX, ['id', id]),
    CACHE_TTL,
    async () => {
      const result = await ReactionRepository.findByIdLean(
        id,
        DEFAULT_POPULATE,
      );
      if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Reaction not found');
      }
      return result;
    },
  );
};

export const getSelfReactions = async (
  user: TJwtPayload,
  guest: TGuest,
  query: Record<string, unknown>,
): Promise<{
  data: TReaction[];
  meta: { total: number; page: number; limit: number };
}> => {
  const cacheKey = generateCacheKey(CACHE_PREFIX, [
    'self',
    user?._id || guest?.token,
    'list',
    query,
  ]);
  return await withCache(cacheKey, CACHE_TTL, async () => {
    if (!user?._id && !guest?.token) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    const filter = {
      ...(user?._id ? { user: user._id } : { guest: guest.token }),
    };

    return await ReactionRepository.findPaginated(
      filter,
      query,
      DEFAULT_POPULATE,
    );
  });
};

export const getReactions = async (
  query: Record<string, unknown>,
): Promise<{
  data: TReaction[];
  meta: { total: number; page: number; limit: number };
}> => {
  const cacheKey = generateCacheKey(CACHE_PREFIX, ['admin', 'list', query]);
  return await withCache(cacheKey, CACHE_TTL, async () => {
    return await ReactionRepository.findPaginated({}, query, DEFAULT_POPULATE);
  });
};

export const updateSelfReaction = async (
  user: TJwtPayload,
  guest: TGuest,
  id: string,
  payload: Partial<Pick<TReaction, 'type'>>,
): Promise<TReaction> => {
  if (!user?._id && !guest?.token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const data = await ReactionRepository.findOneLean({
    _id: id,
    ...(user?._id ? { user: user._id } : { guest: guest.token }),
  });

  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reaction not found');
  }

  const result = await ReactionRepository.updateByIdLean(id, payload);

  if (result) {
    await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
    await invalidateCacheByPattern(`news:*`);
  }

  return result!;
};

export const updateReaction = async (
  id: string,
  payload: Partial<Pick<TReaction, 'type' | 'status'>>,
): Promise<TReaction> => {
  const data = await ReactionRepository.findByIdLean(id);
  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reaction not found');
  }

  const result = await ReactionRepository.updateByIdLean(id, payload);

  if (result) {
    await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
    await invalidateCacheByPattern(`news:*`);
  }

  return result!;
};

export const updateSelfReactions = async (
  user: TJwtPayload,
  guest: TGuest,
  ids: string[],
  payload: Partial<Pick<TReaction, 'status'>>,
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  if (!user?._id && !guest?.token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const userOrGuestFilter = user?._id
    ? { user: user._id }
    : { guest: guest.token };

  const reactions = await ReactionRepository.findManyLean({
    _id: { $in: ids },
    ...userOrGuestFilter,
  });
  const foundIds = reactions.map((reaction) => reaction._id!.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await ReactionRepository.updateMany(
    {
      _id: { $in: foundIds },
      ...userOrGuestFilter,
    },
    payload,
  );

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};

export const updateReactions = async (
  ids: string[],
  payload: Partial<Pick<TReaction, 'status'>>,
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const reactions = await ReactionRepository.findManyLean({
    _id: { $in: ids },
  });
  const foundIds = reactions.map((reaction) => reaction._id!.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await ReactionRepository.updateMany(
    { _id: { $in: foundIds } },
    payload,
  );

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};

export const deleteSelfReaction = async (
  user: TJwtPayload,
  guest: TGuest,
  id: string,
): Promise<void> => {
  if (!user?._id && !guest?.token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const result = await ReactionRepository.findOneAndDelete({
    _id: id,
    ...(user?._id ? { user: user._id } : { guest: guest.token }),
  });

  if (result) {
    await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
    await invalidateCacheByPattern(`news:*`);
  }
};

export const deleteReaction = async (id: string): Promise<void> => {
  const reaction = await ReactionRepository.findByIdLean(id);
  if (!reaction) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reaction not found');
  }

  await ReactionRepository.deleteById(id);
  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
  await invalidateCacheByPattern(`news:*`);
};

export const deleteSelfReactions = async (
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

  const userOrGuestFilter = user?._id
    ? { user: user._id }
    : { guest: guest.token };

  const reactions = await ReactionRepository.findManyLean({
    _id: { $in: ids },
    ...userOrGuestFilter,
  });
  const foundIds = reactions.map((reaction) => reaction._id!.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await ReactionRepository.deleteMany({
    _id: { $in: foundIds },
    ...userOrGuestFilter,
  });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const deleteReactions = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const reactions = await ReactionRepository.findManyLean({
    _id: { $in: ids },
  });
  const foundIds = reactions.map((reaction) => reaction._id!.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await ReactionRepository.deleteMany({ _id: { $in: foundIds } });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};
