import httpStatus from 'http-status';
import AppError from '../../builder/AppError';
import AppQueryFind from '../../builder/AppQueryFind';
import { Guest } from './guest.model';
import { TGuest } from './guest.type';

export const getSelf = async (guest: TGuest): Promise<TGuest> => {
  const result = await Guest.findById(guest._id).lean();
  if (!result) {
    throw new AppError(404, 'Guest not found');
  }
  return result;
};

export const getGuest = async (id: string): Promise<TGuest> => {
  const result = await Guest.findById(id).lean();
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Guest not found');
  }
  return result;
};

export const getGuests = async (
  query: Record<string, unknown>,
): Promise<{
  data: TGuest[];
  meta: { total: number; page: number; limit: number };
}> => {
  const guestQuery = new AppQueryFind(Guest, query)
    .search(['name', 'email'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  const result = await guestQuery.execute();

  return result;
};

export const updateSelf = async (
  guest: TGuest,
  payload: Partial<Pick<TGuest, 'name' | 'email'>>,
): Promise<TGuest> => {
  const data = await Guest.findById(guest._id);
  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'Guest not found');
  }

  const result = await Guest.findByIdAndUpdate(guest._id, payload, {
    new: true,
    runValidators: true,
  });

  return result!;
};

export const updateGuest = async (
  id: string,
  payload: Partial<Pick<TGuest, 'name' | 'email' | 'status'>>,
): Promise<TGuest> => {
  const guest = await Guest.findById(id);
  if (!guest) {
    throw new AppError(httpStatus.NOT_FOUND, 'Guest not found');
  }

  const updatedGuest = await Guest.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return updatedGuest!;
};

export const updateGuests = async (
  ids: string[],
  payload: Partial<Pick<TGuest, 'status'>>,
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const guests = await Guest.find({ _id: { $in: ids } }).lean();
  const foundIds = guests.map((guest) => guest._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await Guest.updateMany(
    { _id: { $in: foundIds } },
    { ...payload },
  );

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};

export const deleteGuest = async (id: string): Promise<void> => {
  const guest = await Guest.findById(id);
  if (!guest) {
    throw new AppError(httpStatus.NOT_FOUND, 'Guest not found');
  }

  await guest.softDelete();
};

export const deleteGuestPermanent = async (id: string): Promise<void> => {
  const guest = await Guest.findById(id);
  if (!guest) {
    throw new AppError(httpStatus.NOT_FOUND, 'Guest not found');
  }

  await Guest.findByIdAndDelete(id);
};

export const deleteGuests = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const guests = await Guest.find({ _id: { $in: ids } }).lean();
  const foundIds = guests.map((guest) => guest._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await Guest.updateMany({ _id: { $in: foundIds } }, { is_deleted: true });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const deleteGuestsPermanent = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const guests = await Guest.find({ _id: { $in: ids } }).lean();
  const foundIds = guests.map((guest) => guest._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await Guest.deleteMany({ _id: { $in: foundIds } });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const restoreGuest = async (id: string): Promise<TGuest> => {
  const guest = await Guest.findOneAndUpdate(
    { _id: id, is_deleted: true },
    { is_deleted: false },
    { new: true },
  );

  if (!guest) {
    throw new AppError(httpStatus.NOT_FOUND, 'Guest not found or not deleted');
  }

  return guest;
};

export const restoreGuests = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const result = await Guest.updateMany(
    { _id: { $in: ids }, is_deleted: true },
    { is_deleted: false },
  );

  const restoredGuests = await Guest.find({ _id: { $in: ids } }).lean();
  const restoredIds = restoredGuests.map((guest) => guest._id.toString());
  const notFoundIds = ids.filter((id) => !restoredIds.includes(id));

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};
