import httpStatus from 'http-status';
import AppError from '../../builder/AppError';
import AppQuery from '../../builder/AppQuery';
import { TGuest } from '../../types/express-session.type';
import { TJwtPayload } from '../auth/auth.type';
import { Reaction } from './reaction.model';
import { TReaction } from './reaction.type';

export const createReaction = async (
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

export const getSelfReaction = async (
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
    throw new AppError(httpStatus.NOT_FOUND, 'Reaction not found');
  }

  return result;
};

export const getReaction = async (id: string): Promise<TReaction> => {
  const result = await Reaction.findById(id).lean();
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reaction not found');
  }
  return result;
};

export const getSelfReactions = async (
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

  const reactionQuery = new AppQuery<TReaction>(
    Reaction.find({
      ...(user?._id ? { user: user._id } : { guest: guest._id }),
    }),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  const result = await reactionQuery.execute();
  return result;
};

export const getReactions = async (
  query: Record<string, unknown>,
): Promise<{
  data: TReaction[];
  meta: { total: number; page: number; limit: number };
}> => {
  const reactionQuery = new AppQuery<TReaction>(Reaction.find(), query)
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  const result = await reactionQuery.execute();
  return result;
};

export const updateSelfReaction = async (
  user: TJwtPayload,
  guest: TGuest,
  id: string,
  payload: Partial<Pick<TReaction, 'type'>>,
): Promise<TReaction> => {
  if (!user?._id && !guest?._id) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const data = await Reaction.findOne({
    _id: id,
    ...(user?._id ? { user: user._id } : { guest: guest._id }),
  }).lean();

  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reaction not found');
  }

  const update: Partial<TReaction> = { ...payload };

  const result = await Reaction.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).lean();

  return result!;
};

export const updateReaction = async (
  id: string,
  payload: Partial<Pick<TReaction, 'type' | 'status'>>,
): Promise<TReaction> => {
  const data = await Reaction.findById(id).lean();
  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reaction not found');
  }

  const update: Partial<TReaction> = { ...payload };

  const result = await Reaction.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).lean();

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
  if (!user?._id && !guest?._id) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const reactions = await Reaction.find({
    _id: { $in: ids },
    ...(user?._id ? { user: user._id } : { guest: guest._id }),
  }).lean();
  const foundIds = reactions.map((reaction) => reaction._id.toString());
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

export const updateReactions = async (
  ids: string[],
  payload: Partial<Pick<TReaction, 'status'>>,
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const reactions = await Reaction.find({ _id: { $in: ids } }).lean();
  const foundIds = reactions.map((reaction) => reaction._id.toString());
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

export const deleteSelfReaction = async (
  user: TJwtPayload,
  guest: TGuest,
  id: string,
): Promise<void> => {
  if (!user?._id && !guest?._id) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const reaction = await Reaction.findOne({
    _id: id,
    ...(user?._id ? { user: user._id } : { guest: guest._id }),
  });
  if (!reaction) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reaction not found');
  }

  await reaction.softDelete();
};

export const deleteReaction = async (id: string): Promise<void> => {
  const reaction = await Reaction.findById(id);
  if (!reaction) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reaction not found');
  }

  await reaction.softDelete();
};

export const deleteReactionPermanent = async (id: string): Promise<void> => {
  const reaction = await Reaction.findById(id).lean();
  if (!reaction) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reaction not found');
  }

  await Reaction.findByIdAndDelete(id);
};

export const deleteSelfReactions = async (
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

  const reactions = await Reaction.find({
    _id: { $in: ids },
    ...(user?._id ? { user: user._id } : { guest: guest._id }),
  }).lean();
  const foundIds = reactions.map((reaction) => reaction._id.toString());
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

export const deleteReactions = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const reactions = await Reaction.find({ _id: { $in: ids } }).lean();
  const foundIds = reactions.map((reaction) => reaction._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await Reaction.updateMany({ _id: { $in: foundIds } }, { is_deleted: true });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const deleteReactionsPermanent = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  // Use lean for finding existing reactions
  const reactions = await Reaction.find({ _id: { $in: ids } }).lean();
  const foundIds = reactions.map((reaction) => reaction._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await Reaction.deleteMany({ _id: { $in: foundIds } });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const restoreSelfReaction = async (
  user: TJwtPayload,
  guest: TGuest,
  id: string,
): Promise<TReaction> => {
  if (!user?._id && !guest?._id) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const reaction = await Reaction.findOneAndUpdate(
    {
      _id: id,
      is_deleted: true,
      ...(user?._id ? { user: user._id } : { guest: guest._id }),
    },
    { is_deleted: false },
    { new: true },
  ).lean();

  if (!reaction) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Reaction not found or not deleted',
    );
  }

  return reaction;
};

export const restoreReaction = async (id: string): Promise<TReaction> => {
  const reaction = await Reaction.findOneAndUpdate(
    { _id: id, is_deleted: true },
    { is_deleted: false },
    { new: true },
  ).lean();

  if (!reaction) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Reaction not found or not deleted',
    );
  }

  return reaction;
};

export const restoreSelfReactions = async (
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

  const restoredReactions = await Reaction.find({
    _id: { $in: ids },
    ...(user?._id ? { user: user._id } : { guest: guest._id }),
  }).lean();
  const restoredIds = restoredReactions.map((reaction) =>
    reaction._id.toString(),
  );
  const notFoundIds = ids.filter((id) => !restoredIds.includes(id));

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};

export const restoreReactions = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const result = await Reaction.updateMany(
    { _id: { $in: ids }, is_deleted: true },
    { is_deleted: false },
  );

  const restoredReactions = await Reaction.find({ _id: { $in: ids } }).lean();
  const restoredIds = restoredReactions.map((reaction) =>
    reaction._id.toString(),
  );
  const notFoundIds = ids.filter((id) => !restoredIds.includes(id));

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};
