import httpStatus from 'http-status';
import { Document } from 'mongoose';
import AppError from '../../builder/AppError';
import AppQuery from '../../builder/AppQuery';
import { TJwtPayload } from '../auth/auth.type';
import { User } from './user.model';
import { TUser } from './user.type';

export const getSelf = async (user: TJwtPayload): Promise<TUser> => {
  const result = await User.findById(user._id).lean();
  if (!result) {
    throw new AppError(404, 'User not found');
  }
  return result;
};

export const getUser = async (id: string): Promise<TUser> => {
  const result = await User.findById(id).lean();
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  return result;
};

export const getUsers = async (
  query: Record<string, unknown>,
): Promise<{
  data: TUser[];
  meta: { total: number; page: number; limit: number };
}> => {
  const userQuery = new AppQuery<Document, TUser>(User.find().lean(), query)
    .search(['name', 'email'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .lean();

  const result = await userQuery.execute();

  return result;
};

export const updateSelf = async (
  user: TJwtPayload,
  payload: Partial<Pick<TUser, 'name' | 'email'>>,
): Promise<TUser> => {
  const data = await User.findById(user._id);
  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const result = await User.findByIdAndUpdate(user._id, payload, {
    new: true,
    runValidators: true,
  });

  return result!;
};

export const updateUser = async (
  id: string,
  payload: Partial<
    Pick<TUser, 'name' | 'email' | 'role' | 'status' | 'is_verified'>
  >,
): Promise<TUser> => {
  const data = await User.findById(id);
  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const updatedUser = await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return updatedUser!;
};

export const updateUsers = async (
  ids: string[],
  payload: Partial<Pick<TUser, 'role' | 'status' | 'is_verified'>>,
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const users = await User.find({ _id: { $in: ids } }).lean();
  const foundIds = users.map((user) => user._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await User.updateMany(
    { _id: { $in: foundIds } },
    { ...payload },
  );

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};

export const deleteUser = async (id: string): Promise<void> => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  await user.softDelete();
};

export const deleteUserPermanent = async (id: string): Promise<void> => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  await User.findByIdAndDelete(id);
};

export const deleteUsers = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const users = await User.find({ _id: { $in: ids } }).lean();
  const foundIds = users.map((user) => user._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await User.updateMany({ _id: { $in: foundIds } }, { is_deleted: true });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const deleteUsersPermanent = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const users = await User.find({ _id: { $in: ids } }).lean();
  const foundIds = users.map((user) => user._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await User.deleteMany({ _id: { $in: foundIds } });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const restoreUser = async (id: string): Promise<TUser> => {
  const user = await User.findOneAndUpdate(
    { _id: id, is_deleted: true },
    { is_deleted: false },
    { new: true },
  );

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found or not deleted');
  }

  return user;
};

export const restoreUsers = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const result = await User.updateMany(
    { _id: { $in: ids }, is_deleted: true },
    { is_deleted: false },
  );

  const restoredUsers = await User.find({ _id: { $in: ids } }).lean();
  const restoredIds = restoredUsers.map((user) => user._id.toString());
  const notFoundIds = ids.filter((id) => !restoredIds.includes(id));

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};
