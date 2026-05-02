import httpStatus from 'http-status';
import AppError from '../../builder/app-error';
import { TJwtPayload } from '../../types/jsonwebtoken.type';
import {
  generateCacheKey,
  invalidateCacheByPattern,
  withCache,
} from '../../utils/cache.utils';
import { TGuest } from '../guest/guest.type';
import * as UserProfileRepository from '../user-profile/user-profile.repository';
import { BadgeService } from '../badge/badge.service';
import * as CommentRepository from './comment.repository';
import { TComment } from './comment.type';

const CACHE_PREFIX = 'comment';
const CACHE_TTL = 600; // 10 minutes

export const createComment = async (
  user: TJwtPayload,
  guest: TGuest,
  payload: TComment,
): Promise<TComment> => {
  if (!user?._id && !guest?.token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const update = {
    ...payload,
    ...(user?._id ? { user: user._id } : {}),
    ...(guest?.token ? { guest: guest.token } : {}),
  } as Partial<TComment>;

  const result = await CommentRepository.create(update);

  // Update user activity stats
  if (user?._id) {
    await UserProfileRepository.incrementActivityStat(
      user._id,
      'total_comments',
    );
    BadgeService.checkAndAwardBadges(user._id).catch(
      // eslint-disable-next-line no-console
      (err) => console.error('Badge check error:', err),
    );
  }

  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
  return result.toObject();
};

export const getSelfComment = async (
  user: TJwtPayload,
  guest: TGuest,
  id: string,
): Promise<TComment> => {
  if (!user?._id && !guest?.token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const cacheKey = generateCacheKey(CACHE_PREFIX, [
    'self',
    user?._id || guest?.token,
    id,
  ]);
  return await withCache(cacheKey, CACHE_TTL, async () => {
    const result = await CommentRepository.findOneLean(
      {
        _id: id,
        ...(user?._id ? { user: user._id } : { guest: guest.token }),
      },
      [
        { path: 'user', select: '_id name email image' },
        { path: 'news', select: '_id slug title thumbnail' },
      ],
    );

    if (!result) {
      throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
    }

    return result;
  });
};

export const getComment = async (id: string): Promise<TComment> => {
  return await withCache(
    generateCacheKey(CACHE_PREFIX, ['id', id]),
    CACHE_TTL,
    async () => {
      const result = await CommentRepository.findByIdLean(id, [
        { path: 'user', select: '_id name email image' },
        { path: 'news', select: '_id slug title thumbnail' },
      ]);

      if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
      }

      return result;
    },
  );
};

export const getPublicComments = async (
  query: Record<string, unknown>,
): Promise<{
  data: TComment[];
  meta: { total: number; page: number; limit: number };
}> => {
  const cacheKey = generateCacheKey(CACHE_PREFIX, ['public', 'list', query]);
  return await withCache(cacheKey, CACHE_TTL, async () => {
    const result = await CommentRepository.findPaginated(
      { status: 'approved' },
      query,
      [
        { path: 'user', select: '_id name email image' },
        { path: 'news', select: '_id slug title thumbnail' },
      ],
    );
    return result;
  });
};

export const getSelfComments = async (
  user: TJwtPayload,
  guest: TGuest,
  query: Record<string, unknown>,
): Promise<{
  data: TComment[];
  meta: { total: number; page: number; limit: number };
}> => {
  if (!user?._id && !guest?.token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const cacheKey = generateCacheKey(CACHE_PREFIX, [
    'self',
    user?._id || guest?.token,
    'list',
    query,
  ]);
  return await withCache(cacheKey, CACHE_TTL, async () => {
    const filter = {
      ...(user?._id ? { user: user._id } : { guest: guest.token }),
    };

    const result = await CommentRepository.findPaginated(filter, query, [
      { path: 'user', select: '_id name email image' },
      { path: 'news', select: '_id slug title thumbnail' },
    ]);

    return result;
  });
};

export const getComments = async (
  query: Record<string, unknown>,
): Promise<{
  data: TComment[];
  meta: { total: number; page: number; limit: number };
}> => {
  const cacheKey = generateCacheKey(CACHE_PREFIX, ['admin', 'list', query]);
  return await withCache(cacheKey, CACHE_TTL, async () => {
    const result = await CommentRepository.findPaginated({}, query, [
      { path: 'user', select: '_id name email image' },
      { path: 'news', select: '_id slug title thumbnail' },
    ]);
    return result;
  });
};

export const updateSelfComment = async (
  user: TJwtPayload,
  guest: TGuest,
  id: string,
  payload: Partial<Pick<TComment, 'content' | 'name' | 'email'>>,
): Promise<TComment> => {
  if (!user?._id && !guest?.token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const data = await CommentRepository.findOneLean({
    _id: id,
    ...(user?._id ? { user: user._id } : { guest: guest.token }),
  });

  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  const update: Partial<TComment> = { ...payload };

  if (Object.keys(payload).includes('content')) {
    update.is_edited = true;
    update.edited_at = new Date();
  }

  const result = await CommentRepository.findByIdAndUpdateLean(id, update);

  if (result) {
    await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
  }

  return result!;
};

export const updateComment = async (
  id: string,
  payload: Partial<Pick<TComment, 'content' | 'status'>>,
): Promise<TComment> => {
  const data = await CommentRepository.findByIdLean(id);
  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  const update: Partial<TComment> = { ...payload };

  if (Object.keys(payload).includes('content')) {
    update.is_edited = true;
    update.edited_at = new Date();
  }

  const result = await CommentRepository.findByIdAndUpdateLean(id, update);

  if (result) {
    await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
  }

  return result!;
};

export const updateSelfComments = async (
  user: TJwtPayload,
  guest: TGuest,
  ids: string[],
  payload: Partial<Pick<TComment, 'status'>>,
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  if (!user?._id && !guest?.token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const comments = await CommentRepository.findManyLean({
    _id: { $in: ids },
    ...(user?._id ? { user: user._id } : { guest: guest.token }),
  });
  const foundIds = comments.map((comment) => comment._id!.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await CommentRepository.updateMany(
    {
      _id: { $in: foundIds },
      ...(user?._id ? { user: user._id } : { guest: guest.token }),
    },
    { ...payload },
  );

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};

export const updateComments = async (
  ids: string[],
  payload: Partial<Pick<TComment, 'status'>>,
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const comments = await CommentRepository.findManyLean({ _id: { $in: ids } });
  const foundIds = comments.map((comment) => comment._id!.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await CommentRepository.updateMany(
    { _id: { $in: foundIds } },
    { ...payload },
  );

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};

export const deleteSelfComment = async (
  user: TJwtPayload,
  guest: TGuest,
  id: string,
): Promise<void> => {
  if (!user?._id && !guest?.token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const comment = await CommentRepository.findOne({
    _id: id,
    ...(user?._id ? { user: user._id } : { guest: guest.token }),
  });
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  await comment.softDelete();
  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
};

export const deleteComment = async (id: string): Promise<void> => {
  const comment = await CommentRepository.findById(id);
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  await comment.softDelete();
  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
};

export const deleteCommentPermanent = async (id: string): Promise<void> => {
  const comment = await CommentRepository.findByIdLean(id, [], {
    bypassDeleted: true,
  });
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  await CommentRepository.deleteById(id);
};

export const deleteSelfComments = async (
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

  const comments = await CommentRepository.findManyLean({
    _id: { $in: ids },
    ...(user?._id ? { user: user._id } : { guest: guest.token }),
  });
  const foundIds = comments.map((comment) => comment._id!.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await CommentRepository.updateMany(
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

export const deleteComments = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const comments = await CommentRepository.findManyLean({ _id: { $in: ids } });
  const foundIds = comments.map((comment) => comment._id!.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await CommentRepository.updateMany(
    { _id: { $in: foundIds } },
    { is_deleted: true },
  );

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const deleteCommentsPermanent = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const comments = await CommentRepository.findManyLean(
    { _id: { $in: ids }, is_deleted: true },
    [],
    { bypassDeleted: true },
  );
  const foundIds = comments.map((comment) => comment._id!.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await CommentRepository.deleteMany(
    {
      _id: { $in: foundIds },
      is_deleted: true,
    },
    { bypassDeleted: true },
  );

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const restoreSelfComment = async (
  user: TJwtPayload,
  guest: TGuest,
  id: string,
): Promise<TComment> => {
  if (!user?._id && !guest?.token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const comment = await CommentRepository.findOneAndUpdateLean(
    {
      _id: id,
      is_deleted: true,
      ...(user?._id ? { user: user._id } : { guest: guest.token }),
    },
    { is_deleted: false },
  );

  if (!comment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Comment not found or not deleted',
    );
  }

  return comment;
};

export const restoreComment = async (id: string): Promise<TComment> => {
  const comment = await CommentRepository.findOneAndUpdateLean(
    { _id: id, is_deleted: true },
    { is_deleted: false },
  );

  if (!comment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Comment not found or not deleted',
    );
  }

  return comment;
};

export const restoreSelfComments = async (
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

  const result = await CommentRepository.updateMany(
    {
      _id: { $in: ids },
      is_deleted: true,
      ...(user?._id ? { user: user._id } : { guest: guest.token }),
    },
    { is_deleted: false },
  );

  const restoredComments = await CommentRepository.findManyLean({
    _id: { $in: ids },
    ...(user?._id ? { user: user._id } : { guest: guest.token }),
  });
  const restoredIds = restoredComments.map((comment) =>
    comment._id!.toString(),
  );
  const notFoundIds = ids.filter((id) => !restoredIds.includes(id));

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};

export const restoreComments = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const result = await CommentRepository.updateMany(
    { _id: { $in: ids }, is_deleted: true },
    { is_deleted: false },
  );

  const restoredComments = await CommentRepository.findManyLean({
    _id: { $in: ids },
  });
  const restoredIds = restoredComments.map((comment) =>
    comment._id!.toString(),
  );
  const notFoundIds = ids.filter((id) => !restoredIds.includes(id));

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};
