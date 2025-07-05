import httpStatus from 'http-status';
import AppError from '../../builder/AppError';
import AppQuery from '../../builder/AppQuery';
import { TJwtPayload } from '../auth/auth.type';
import { User } from './user.model';
import { TUser, TUserDocument } from './user.type';

export const getSelf = async (user: TJwtPayload): Promise<TUserDocument> => {
  const result = await User.findById(user._id);
  if (!result) {
    throw new AppError(404, 'User not found');
  }
  return result;
};

export const getUser = async (id: string): Promise<TUserDocument> => {
  const result = await User.findById(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  return result;
};

export const getUsers = async (
  query: Record<string, unknown>,
): Promise<{
  data: TUserDocument[];
  meta: { total: number; page: number; limit: number };
}> => {
  const userQuery = new AppQuery(User.find(), query)
    .search(['name', 'email'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await userQuery.execute();

  return result;
};

export const updateUser = async (
  user: TJwtPayload,
  payload: Partial<Pick<TUser, 'name' | 'email'>>,
): Promise<TUserDocument> => {
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

export const updateUserByAdmin = async (
  id: string,
  payload: Partial<
    Pick<TUser, 'name' | 'email' | 'role' | 'status' | 'is_verified'>
  >,
): Promise<TUserDocument> => {
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

export const updateUsersByAdmin = async (
  ids: string[],
  payload: Partial<Pick<TUser, 'role' | 'status' | 'is_verified'>>,
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const users = await User.find({ _id: { $in: ids } });
  const foundIds = users.map((user) => user._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await User.updateMany(
    { _id: { $in: foundIds } },
    { ...payload, updated_at: new Date() },
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
  const users = await User.find({ _id: { $in: ids } });
  const foundIds = users.map((user) => user._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await User.updateMany(
    { _id: { $in: foundIds } },
    { is_deleted: true, updated_at: new Date() },
  );

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
  const users = await User.find({ _id: { $in: ids } });
  const foundIds = users.map((user) => user._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await User.deleteMany({ _id: { $in: foundIds } });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const restoreUser = async (id: string): Promise<TUserDocument> => {
  const user = await User.findOneAndUpdate(
    { _id: id, is_deleted: true },
    { is_deleted: false, updated_at: new Date() },
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
    { is_deleted: false, updated_at: new Date() },
  );

  const restoredUsers = await User.find({ _id: { $in: ids } });
  const restoredIds = restoredUsers.map((user) => user._id.toString());
  const notFoundIds = ids.filter((id) => !restoredIds.includes(id));

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};
