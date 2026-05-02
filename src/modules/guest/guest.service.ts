import httpStatus from 'http-status';
import AppError from '../../builder/app-error';
import * as GuestRepository from './guest.repository';
import { TGuest } from './guest.type';

export const getSelf = async (guest: TGuest): Promise<TGuest> => {
  const result = await GuestRepository.findByIdLean(guest._id.toString());
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Guest not found');
  }
  return result;
};

export const getGuest = async (id: string): Promise<TGuest> => {
  const result = await GuestRepository.findByIdLean(id);
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
  const result = await GuestRepository.findPaginated({}, query);
  return result;
};

export const updateSelf = async (
  guest: TGuest,
  payload: Partial<Pick<TGuest, 'name' | 'email'>>,
): Promise<TGuest> => {
  const data = await GuestRepository.findById(guest._id.toString());
  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'Guest not found');
  }

  const result = await GuestRepository.updateByIdLean(
    guest._id.toString(),
    payload,
  );

  return result!;
};

export const updateGuest = async (
  id: string,
  payload: Partial<Pick<TGuest, 'name' | 'email' | 'status'>>,
): Promise<TGuest> => {
  const guest = await GuestRepository.findById(id);
  if (!guest) {
    throw new AppError(httpStatus.NOT_FOUND, 'Guest not found');
  }

  const updatedGuest = await GuestRepository.updateByIdLean(id, payload);

  return updatedGuest!;
};

export const updateGuests = async (
  ids: string[],
  payload: Partial<Pick<TGuest, 'status'>>,
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const guests = await GuestRepository.findManyLean({ _id: { $in: ids } });
  const foundIds = guests.map((guest) => guest._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await GuestRepository.updateMany(
    { _id: { $in: foundIds } },
    { ...payload },
  );

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};

export const deleteGuest = async (id: string): Promise<void> => {
  const guest = await GuestRepository.findById(id);
  if (!guest) {
    throw new AppError(httpStatus.NOT_FOUND, 'Guest not found');
  }

  await guest.softDelete();
};

export const deleteGuestPermanent = async (id: string): Promise<void> => {
  const guest = await GuestRepository.findById(id);
  if (!guest) {
    throw new AppError(httpStatus.NOT_FOUND, 'Guest not found');
  }

  await GuestRepository.deleteById(id);
};

export const deleteGuests = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const guests = await GuestRepository.findManyLean({ _id: { $in: ids } });
  const foundIds = guests.map((guest) => guest._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await GuestRepository.updateMany(
    { _id: { $in: foundIds } },
    { is_deleted: true },
  );

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
  const guests = await GuestRepository.findManyLean({ _id: { $in: ids } });
  const foundIds = guests.map((guest) => guest._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await GuestRepository.deleteMany({ _id: { $in: foundIds } });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const restoreGuest = async (id: string): Promise<TGuest> => {
  const guest = await GuestRepository.updateOne(
    { _id: id, is_deleted: true },
    { is_deleted: false },
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
  const result = await GuestRepository.updateMany(
    { _id: { $in: ids }, is_deleted: true },
    { is_deleted: false },
  );

  const restoredGuests = await GuestRepository.findManyLean({
    _id: { $in: ids },
  });
  const restoredIds = restoredGuests.map((guest) => guest._id.toString());
  const notFoundIds = ids.filter((id) => !restoredIds.includes(id));

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};
