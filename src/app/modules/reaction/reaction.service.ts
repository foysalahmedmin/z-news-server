import httpStatus from 'http-status';
import { Document } from 'mongoose';
import AppError from '../../builder/AppError';
import AppQuery from '../../builder/AppQuery';
import { TGuest } from '../../types/express-session.type';
import { TJwtPayload } from '../auth/auth.type';
import { Reaction } from './reaction.model';
import { TReaction } from './reaction.type';

export const createComment = async (
  user: TJwtPayload,
  guest: TGuest,
  payload: TReaction,
): Promise<TReaction> => {
  if (!user?._id && !guest?._id) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const update = {
    ...payload,
    ...(user?._id ? { user: user._id } : {}),
    ...(guest?._id ? { guest: guest._id } : {}),
  };

  const result = await Reaction.create(update);
  return result.toObject();
};

export const getSelfComment = async (
  user: TJwtPayload,
  guest: TGuest,
  id: string,
): Promise<TReaction> => {
  if (!user?._id && !guest?._id) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const result = await Reaction.findOne({
    _id: id,
    ...(user?._id ? { user: user._id } : { guest: guest._id }),
  }).lean();

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  return result;
};

export const getComment = async (id: string): Promise<TReaction> => {
  const result = await Reaction.findById(id).lean();
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }
  return result;
};

export const getSelfComments = async (
  user: TJwtPayload,
  guest: TGuest,
  query: Record<string, unknown>,
): Promise<{
  data: TReaction[];
  meta: { total: number; page: number; limit: number };
}> => {
  if (!user?._id && !guest?._id) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const commentQuery = new AppQuery<Document, TReaction>(
    Reaction.find({
      ...(user?._id ? { user: user._id } : { guest: guest._id }),
    }).lean(),
    query,
  )
    .search(['name', 'email', 'content'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await commentQuery.execute();
  return result;
};

export const getComments = async (
  query: Record<string, unknown>,
): Promise<{
  data: TReaction[];
  meta: { total: number; page: number; limit: number };
}> => {
  const commentQuery = new AppQuery<Document, TReaction>(
    Reaction.find().lean(),
    query,
  )
    .search(['name', 'email', 'content'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await commentQuery.execute();
  return result;
};

export const updateSelfComment = async (
  user: TJwtPayload,
  guest: TGuest,
  id: string,
  payload: Partial<Pick<TReaction, 'content' | 'name' | 'email'>>,
): Promise<TReaction> => {
  if (!user?._id && !guest?._id) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const data = await Reaction.findOne({
    _id: id,
    ...(user?._id ? { user: user._id } : { guest: guest._id }),
  }).lean();

  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  const update: Partial<TReaction> = { ...payload };

  if (Object.keys(payload).includes('content')) {
    update.is_edited = true;
    update.edited_at = new Date();
  }

  const result = await Reaction.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).lean();

  return result!;
};

export const updateComment = async (
  id: string,
  payload: Partial<Pick<TReaction, 'content' | 'status'>>,
): Promise<TReaction> => {
  const data = await Reaction.findById(id).lean();
  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  const update: Partial<TReaction> = { ...payload };

  if (Object.keys(payload).includes('content')) {
    update.is_edited = true;
    update.edited_at = new Date();
  }

  const result = await Reaction.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).lean();

  return result!;
};

export const updateSelfComments = async (
  user: TJwtPayload,
  guest: TGuest,
  ids: string[],
  payload: Partial<Pick<TReaction, 'status'>>,
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  if (!user?._id && !guest?._id) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const comments = await Reaction.find({
    _id: { $in: ids },
    ...(user?._id ? { user: user._id } : { guest: guest._id }),
  }).lean();
  const foundIds = comments.map((comment) => comment._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await Reaction.updateMany(
    {
      _id: { $in: foundIds },
      ...(user?._id ? { user: user._id } : { guest: guest._id }),
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
  payload: Partial<Pick<TReaction, 'status'>>,
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const comments = await Reaction.find({ _id: { $in: ids } }).lean();
  const foundIds = comments.map((comment) => comment._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await Reaction.updateMany(
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
  if (!user?._id && !guest?._id) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const comment = await Reaction.findOne({
    _id: id,
    ...(user?._id ? { user: user._id } : { guest: guest._id }),
  });
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  await comment.softDelete();
};

export const deleteComment = async (id: string): Promise<void> => {
  const comment = await Reaction.findById(id);
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  await comment.softDelete();
};

export const deleteCommentPermanent = async (id: string): Promise<void> => {
  const comment = await Reaction.findById(id).lean();
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  await Reaction.findByIdAndDelete(id);
};

export const deleteSelfComments = async (
  user: TJwtPayload,
  guest: TGuest,
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  if (!user?._id && !guest?._id) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const comments = await Reaction.find({
    _id: { $in: ids },
    ...(user?._id ? { user: user._id } : { guest: guest._id }),
  }).lean();
  const foundIds = comments.map((comment) => comment._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await Reaction.updateMany(
    {
      _id: { $in: foundIds },
      ...(user?._id ? { user: user._id } : { guest: guest._id }),
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
  const comments = await Reaction.find({ _id: { $in: ids } }).lean();
  const foundIds = comments.map((comment) => comment._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await Reaction.updateMany({ _id: { $in: foundIds } }, { is_deleted: true });

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
  const comments = await Reaction.find({ _id: { $in: ids } }).lean();
  const foundIds = comments.map((comment) => comment._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await Reaction.deleteMany({ _id: { $in: foundIds } });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const restoreSelfComment = async (
  user: TJwtPayload,
  guest: TGuest,
  id: string,
): Promise<TReaction> => {
  if (!user?._id && !guest?._id) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const comment = await Reaction.findOneAndUpdate(
    {
      _id: id,
      is_deleted: true,
      ...(user?._id ? { user: user._id } : { guest: guest._id }),
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

export const restoreComment = async (id: string): Promise<TReaction> => {
  const comment = await Reaction.findOneAndUpdate(
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
  if (!user?._id && !guest?._id) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const result = await Reaction.updateMany(
    {
      _id: { $in: ids },
      is_deleted: true,
      ...(user?._id ? { user: user._id } : { guest: guest._id }),
    },
    { is_deleted: false },
  );

  const restoredComments = await Reaction.find({
    _id: { $in: ids },
    ...(user?._id ? { user: user._id } : { guest: guest._id }),
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
  const result = await Reaction.updateMany(
    { _id: { $in: ids }, is_deleted: true },
    { is_deleted: false },
  );

  const restoredComments = await Reaction.find({ _id: { $in: ids } }).lean();
  const restoredIds = restoredComments.map((comment) => comment._id.toString());
  const notFoundIds = ids.filter((id) => !restoredIds.includes(id));

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};
