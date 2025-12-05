import httpStatus from 'http-status';
import AppError from '../../builder/AppError';
import AppQueryFind from '../../builder/AppQueryFind';
import { TJwtPayload } from '../auth/auth.type';
import { TGuest } from '../guest/guest.type';
import { Reaction } from './reaction.model';
import { TReaction } from './reaction.type';

export const createReaction = async (
  user: TJwtPayload,
  guest: TGuest,
  payload: TReaction,
): Promise<TReaction> => {
  if (!user?._id && !guest?.token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const update = {
    ...payload,
    ...(user?._id ? { user: user._id } : {}),
    ...(guest?.token ? { guest: guest.token } : {}),
  };

  const result = await Reaction.create(update);
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

  const query = user?._id
    ? { news: news_id, user: user._id }
    : guest?.token
      ? { news: news_id, guest: guest.token }
      : null;

  const [data, likes, dislikes] = await Promise.all([
    query ? Reaction.findOne(query).lean() : Promise.resolve(null),
    Reaction.countDocuments({ news: news_id, type: 'like' }),
    Reaction.countDocuments({ news: news_id, type: 'dislike' }),
  ]);

  return { data, meta: { likes, dislikes }, guest };
};

export const getSelfReaction = async (
  user: TJwtPayload,
  guest: TGuest,
  id: string,
): Promise<TReaction> => {
  if (!user?._id && !guest?.token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const result = await Reaction.findOne({
    _id: id,
    ...(user?._id ? { user: user._id } : { guest: guest.token }),
  })
    .populate([
      { path: 'user', select: '_id name email image' },
      { path: 'news', select: '_id slug title thumbnail' },
    ])
    .lean();

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reaction not found');
  }

  return result;
};

export const getReaction = async (id: string): Promise<TReaction> => {
  const result = await Reaction.findById(id)
    .populate([
      { path: 'user', select: '_id name email image' },
      { path: 'news', select: '_id slug title thumbnail' },
    ])
    .lean();
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
  console.log(user, guest);
  if (!user?._id && !guest?.token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const reactionQuery = new AppQueryFind(Reaction, {
    ...(user?._id ? { user: user._id } : { guest: guest.token }),
    ...query,
  })
    .populate([
      { path: 'user', select: '_id name email image' },
      { path: 'news', select: '_id slug title thumbnail' },
    ])
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
  const reactionQuery = new AppQueryFind(Reaction, query)
    .populate([
      { path: 'user', select: '_id name email image' },
      { path: 'news', select: '_id slug title thumbnail' },
    ])
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
  if (!user?._id && !guest?.token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const data = await Reaction.findOne({
    _id: id,
    ...(user?._id ? { user: user._id } : { guest: guest.token }),
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
  if (!user?._id && !guest?.token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const reactions = await Reaction.find({
    _id: { $in: ids },
    ...(user?._id ? { user: user._id } : { guest: guest.token }),
  }).lean();
  const foundIds = reactions.map((reaction) => reaction._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await Reaction.updateMany(
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
  if (!user?._id && !guest?.token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  await Reaction.findOneAndDelete({
    _id: id,
    ...(user?._id ? { user: user._id } : { guest: guest.token }),
  });
};

export const deleteReaction = async (id: string): Promise<void> => {
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
  if (!user?._id && !guest?.token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const reactions = await Reaction.find({
    _id: { $in: ids },
    ...(user?._id ? { user: user._id } : { guest: guest.token }),
  }).lean();
  const foundIds = reactions.map((reaction) => reaction._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await Reaction.deleteMany({
    _id: { $in: foundIds },
    ...(user?._id ? { user: user._id } : { guest: guest.token }),
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
  const reactions = await Reaction.find({ _id: { $in: ids } }).lean();
  const foundIds = reactions.map((reaction) => reaction._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await Reaction.deleteMany({ _id: { $in: foundIds } });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};
