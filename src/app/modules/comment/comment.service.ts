import httpStatus from 'http-status';
import AppError from '../../builder/AppError';
import AppQuery from '../../builder/AppQuery';
import { TJwtPayload } from '../auth/auth.type';
import { TGuest } from '../guest/guest.type';
import { Comment } from './comment.model';
import { TComment } from './comment.type';

export const createComment = async (
  user: TJwtPayload,
  guest: TGuest,
  payload: TComment,
): Promise<TComment> => {
  if (!user?._id && !guest?.guest_token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const update = {
    ...payload,
    ...(user?._id ? { user: user._id } : {}),
    ...(guest?.guest_token ? { guest: guest.guest_token } : {}),
  };

  const result = await Comment.create(update);
  return result.toObject();
};

export const getSelfComment = async (
  user: TJwtPayload,
  guest: TGuest,
  id: string,
): Promise<TComment> => {
  if (!user?._id && !guest?.guest_token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const result = await Comment.findOne({
    _id: id,
    ...(user?._id ? { user: user._id } : { guest: guest.guest_token }),
  }).lean();

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  return result;
};

export const getComment = async (id: string): Promise<TComment> => {
  const result = await Comment.findById(id).lean();
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }
  return result;
};

export const getPublicComments = async (
  query: Record<string, unknown>,
): Promise<{
  data: TComment[];
  meta: { total: number; page: number; limit: number };
}> => {
  const commentQuery = new AppQuery<TComment>(Comment.find(), query)
    .search(['name', 'email', 'content'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  const result = await commentQuery.execute();
  return result;
};

export const getSelfComments = async (
  user: TJwtPayload,
  guest: TGuest,
  query: Record<string, unknown>,
): Promise<{
  data: TComment[];
  meta: { total: number; page: number; limit: number };
}> => {
  if (!user?._id && !guest?.guest_token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const commentQuery = new AppQuery<TComment>(
    Comment.find({
      ...(user?._id ? { user: user._id } : { guest: guest.guest_token }),
    }),
    query,
  )
    .search(['name', 'email', 'content'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  const result = await commentQuery.execute();
  return result;
};

export const getComments = async (
  query: Record<string, unknown>,
): Promise<{
  data: TComment[];
  meta: { total: number; page: number; limit: number };
}> => {
  const commentQuery = new AppQuery<TComment>(Comment.find(), query)
    .search(['name', 'email', 'content'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  const result = await commentQuery.execute();
  return result;
};

export const updateSelfComment = async (
  user: TJwtPayload,
  guest: TGuest,
  id: string,
  payload: Partial<Pick<TComment, 'content' | 'name' | 'email'>>,
): Promise<TComment> => {
  if (!user?._id && !guest?.guest_token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const data = await Comment.findOne({
    _id: id,
    ...(user?._id ? { user: user._id } : { guest: guest.guest_token }),
  }).lean();

  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  const update: Partial<TComment> = { ...payload };

  if (Object.keys(payload).includes('content')) {
    update.is_edited = true;
    update.edited_at = new Date();
  }

  const result = await Comment.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).lean();

  return result!;
};

export const updateComment = async (
  id: string,
  payload: Partial<Pick<TComment, 'content' | 'status'>>,
): Promise<TComment> => {
  const data = await Comment.findById(id).lean();
  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  const update: Partial<TComment> = { ...payload };

  if (Object.keys(payload).includes('content')) {
    update.is_edited = true;
    update.edited_at = new Date();
  }

  const result = await Comment.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).lean();

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
  if (!user?._id && !guest?.guest_token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const comments = await Comment.find({
    _id: { $in: ids },
    ...(user?._id ? { user: user._id } : { guest: guest.guest_token }),
  }).lean();
  const foundIds = comments.map((comment) => comment._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await Comment.updateMany(
    {
      _id: { $in: foundIds },
      ...(user?._id ? { user: user._id } : { guest: guest.guest_token }),
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
  const comments = await Comment.find({ _id: { $in: ids } }).lean();
  const foundIds = comments.map((comment) => comment._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await Comment.updateMany(
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
  if (!user?._id && !guest?.guest_token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const comment = await Comment.findOne({
    _id: id,
    ...(user?._id ? { user: user._id } : { guest: guest.guest_token }),
  });
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  await comment.softDelete();
};

export const deleteComment = async (id: string): Promise<void> => {
  const comment = await Comment.findById(id);
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  await comment.softDelete();
};

export const deleteCommentPermanent = async (id: string): Promise<void> => {
  const comment = await Comment.findById(id).lean();
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  await Comment.findByIdAndDelete(id);
};

export const deleteSelfComments = async (
  user: TJwtPayload,
  guest: TGuest,
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  if (!user?._id && !guest?.guest_token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const comments = await Comment.find({
    _id: { $in: ids },
    ...(user?._id ? { user: user._id } : { guest: guest.guest_token }),
  }).lean();
  const foundIds = comments.map((comment) => comment._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await Comment.updateMany(
    {
      _id: { $in: foundIds },
      ...(user?._id ? { user: user._id } : { guest: guest.guest_token }),
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
  const comments = await Comment.find({ _id: { $in: ids } }).lean();
  const foundIds = comments.map((comment) => comment._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await Comment.updateMany({ _id: { $in: foundIds } }, { is_deleted: true });

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
  // Use lean for finding existing comments
  const comments = await Comment.find({ _id: { $in: ids } }).lean();
  const foundIds = comments.map((comment) => comment._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await Comment.deleteMany({ _id: { $in: foundIds } });

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
  if (!user?._id && !guest?.guest_token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const comment = await Comment.findOneAndUpdate(
    {
      _id: id,
      is_deleted: true,
      ...(user?._id ? { user: user._id } : { guest: guest.guest_token }),
    },
    { is_deleted: false },
    { new: true },
  ).lean();

  if (!comment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Comment not found or not deleted',
    );
  }

  return comment;
};

export const restoreComment = async (id: string): Promise<TComment> => {
  const comment = await Comment.findOneAndUpdate(
    { _id: id, is_deleted: true },
    { is_deleted: false },
    { new: true },
  ).lean();

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
  if (!user?._id && !guest?.guest_token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const result = await Comment.updateMany(
    {
      _id: { $in: ids },
      is_deleted: true,
      ...(user?._id ? { user: user._id } : { guest: guest.guest_token }),
    },
    { is_deleted: false },
  );

  const restoredComments = await Comment.find({
    _id: { $in: ids },
    ...(user?._id ? { user: user._id } : { guest: guest.guest_token }),
  }).lean();
  const restoredIds = restoredComments.map((comment) => comment._id.toString());
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
  const result = await Comment.updateMany(
    { _id: { $in: ids }, is_deleted: true },
    { is_deleted: false },
  );

  const restoredComments = await Comment.find({ _id: { $in: ids } }).lean();
  const restoredIds = restoredComments.map((comment) => comment._id.toString());
  const notFoundIds = ids.filter((id) => !restoredIds.includes(id));

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};
