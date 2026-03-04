/**
 * Guest Repository
 *
 * Handles ALL direct database interactions for the Guest module.
 * The service layer must NEVER import from `guest.model` directly;
 * it must go through this repository.
 */

import { PopulateOptions } from 'mongoose';
import AppQueryFind from '../../builder/app-query-find';
import { Guest } from './guest.model';
import { TGuest, TGuestDocument } from './guest.type';

type TPopulate = PopulateOptions | (string | PopulateOptions)[];

// ─── Create ───────────────────────────────────────────────────────────────────

export const create = async (
  payload: Partial<TGuest>,
): Promise<TGuestDocument> => {
  return await Guest.create(payload);
};

// ─── Find One ────────────────────────────────────────────────────────────────

export const findById = async (id: string): Promise<TGuestDocument | null> => {
  return await Guest.findById(id);
};

export const findByIdLean = async (
  id: string,
  populateFields: TPopulate[] = [],
): Promise<TGuest | null> => {
  let query = Guest.findById(id).lean();
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return (await query) as TGuest | null;
};

export const findOne = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
): Promise<TGuestDocument | null> => {
  let query = Guest.findOne(filter);
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return await query;
};

export const findOneLean = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
): Promise<TGuest | null> => {
  let query = Guest.findOne(filter).lean();
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return (await query) as TGuest | null;
};

// ─── Find Many / Counts ───────────────────────────────────────────────────────

export const count = async (
  filter: Record<string, unknown>,
): Promise<number> => {
  return await Guest.countDocuments(filter);
};

export const findManyLean = async (
  filter: Record<string, unknown>,
): Promise<TGuest[]> => {
  return await Guest.find(filter).lean();
};

// ─── Paginated Lists ─────────────────────────────────────────────────────────

export const findPaginated = async (
  filter: Record<string, unknown>,
  query: Record<string, unknown>,
  populateFields: TPopulate[] = [],
): Promise<{
  data: TGuest[];
  meta: { total: number; page: number; limit: number };
}> => {
  const guestQuery = new AppQueryFind(Guest, { ...filter, ...query })
    .search(['name', 'email'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  if (populateFields.length > 0) {
    guestQuery.populate(populateFields as PopulateOptions[]);
  }

  return await guestQuery.execute();
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateById = async (
  id: string,
  payload: Partial<TGuest>,
): Promise<TGuestDocument | null> => {
  return await Guest.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

export const updateByIdLean = async (
  id: string,
  payload: Partial<TGuest>,
): Promise<TGuest | null> => {
  return await Guest.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();
};

export const updateOne = async (
  filter: Record<string, unknown>,
  payload: Partial<TGuest>,
): Promise<TGuestDocument | null> => {
  return await Guest.findOneAndUpdate(filter, payload, {
    new: true,
    runValidators: true,
  });
};

export const updateMany = async (
  filter: Record<string, unknown>,
  payload: Partial<TGuest>,
): Promise<{ modifiedCount: number }> => {
  return await Guest.updateMany(filter, payload);
};

// ─── Delete ──────────────────────────────────────────────────────────────────

export const deleteById = async (
  id: string,
): Promise<TGuestDocument | null> => {
  return await Guest.findByIdAndDelete(id);
};

export const deleteMany = async (
  filter: Record<string, unknown>,
): Promise<{ deletedCount: number }> => {
  return await Guest.deleteMany(filter);
};
