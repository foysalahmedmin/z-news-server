import httpStatus from 'http-status';
import AppError from '../../builder/AppError';
import AppQuery from '../../builder/AppQuery';
import { TJwtPayload } from '../auth/auth.type';
import { TGuest } from '../guest/guest.type';
import { View } from './view.model';
import { TView } from './view.type';

export const createView = async (
  user: TJwtPayload,
  guest: TGuest,
  payload: TView,
): Promise<TView> => {
  if (!user?._id && !guest?.guest_token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const update = {
    ...payload,
    ...(user?._id ? { user: user._id } : {}),
    ...(guest?.guest_token ? { guest: guest.guest_token } : {}),
  };

  const result = await View.create(update);
  return result.toObject();
};

export const getSelfView = async (
  user: TJwtPayload,
  guest: TGuest,
  id: string,
): Promise<TView> => {
  if (!user?._id && !guest?.guest_token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const result = await View.findOne({
    _id: id,
    ...(user?._id ? { user: user._id } : { guest: guest.guest_token }),
  }).lean();

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'View not found');
  }

  return result;
};

export const getView = async (id: string): Promise<TView> => {
  const result = await View.findById(id).lean();
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'View not found');
  }
  return result;
};

export const getSelfViews = async (
  user: TJwtPayload,
  guest: TGuest,
  query: Record<string, unknown>,
): Promise<{
  data: TView[];
  meta: { total: number; page: number; limit: number };
}> => {
  if (!user?._id && !guest?.guest_token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const viewQuery = new AppQuery<TView>(
    View.find({
      ...(user?._id ? { user: user._id } : { guest: guest.guest_token }),
    }),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  const result = await viewQuery.execute();
  return result;
};

export const getViews = async (
  query: Record<string, unknown>,
): Promise<{
  data: TView[];
  meta: { total: number; page: number; limit: number };
}> => {
  const viewQuery = new AppQuery<TView>(View.find(), query)
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  const result = await viewQuery.execute();
  return result;
};

export const deleteSelfView = async (
  user: TJwtPayload,
  guest: TGuest,
  id: string,
): Promise<void> => {
  if (!user?._id && !guest?.guest_token) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  await View.findOneAndDelete({
    _id: id,
    ...(user?._id ? { user: user._id } : { guest: guest.guest_token }),
  });
};

export const deleteView = async (id: string): Promise<void> => {
  const view = await View.findById(id).lean();
  if (!view) {
    throw new AppError(httpStatus.NOT_FOUND, 'View not found');
  }

  await View.findByIdAndDelete(id);
};

export const deleteSelfViews = async (
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

  const views = await View.find({
    _id: { $in: ids },
    ...(user?._id ? { user: user._id } : { guest: guest.guest_token }),
  }).lean();
  const foundIds = views.map((view) => view._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await View.deleteMany(
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

export const deleteViews = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const views = await View.find({ _id: { $in: ids } }).lean();
  const foundIds = views.map((view) => view._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await View.deleteMany({ _id: { $in: foundIds } });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};
