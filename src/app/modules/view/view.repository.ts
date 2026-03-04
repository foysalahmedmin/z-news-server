/**
 * View Repository
 *
 * Handles ALL direct database interactions for the View module.
 * The service layer must NEVER import from `view.model` directly.
 */

import { PopulateOptions } from 'mongoose';
import AppQueryFind from '../../builder/app-query-find';
import { View } from './view.model';
import { TView, TViewDocument } from './view.type';

type TPopulate = PopulateOptions | (string | PopulateOptions)[];

// ─── Create ───────────────────────────────────────────────────────────────────

export const create = async (
  payload: Partial<TView>,
): Promise<TViewDocument> => {
  return await View.create(payload);
};

// ─── Find One ────────────────────────────────────────────────────────────────

export const findById = async (id: string): Promise<TViewDocument | null> => {
  return await View.findById(id);
};

export const findByIdLean = async (
  id: string,
  populateFields: TPopulate[] = [],
): Promise<TView | null> => {
  let query = View.findById(id).lean();
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return (await query) as TView | null;
};

export const findOne = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
): Promise<TViewDocument | null> => {
  let query = View.findOne(filter);
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return await query;
};

export const findOneLean = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
): Promise<TView | null> => {
  let query = View.findOne(filter).lean();
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return (await query) as TView | null;
};

// ─── Find Many / Counts ───────────────────────────────────────────────────────

export const count = async (
  filter: Record<string, unknown>,
): Promise<number> => {
  return await View.countDocuments(filter);
};

export const findManyLean = async (
  filter: Record<string, unknown>,
): Promise<TView[]> => {
  return await View.find(filter).lean();
};

// ─── Paginated Lists ─────────────────────────────────────────────────────────

export const findPaginated = async (
  filter: Record<string, unknown>,
  query: Record<string, unknown>,
  populateFields: TPopulate[] = [],
): Promise<{
  data: TView[];
  meta: { total: number; page: number; limit: number };
}> => {
  const viewQuery = new AppQueryFind(View, { ...filter, ...query })
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  if (populateFields.length > 0) {
    viewQuery.populate(populateFields as PopulateOptions[]);
  }

  return await viewQuery.execute();
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateById = async (
  id: string,
  payload: Partial<TView>,
): Promise<TViewDocument | null> => {
  return await View.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

export const updateMany = async (
  filter: Record<string, unknown>,
  payload: Partial<TView>,
): Promise<{ modifiedCount: number }> => {
  return await View.updateMany(filter, payload);
};

// ─── Delete ──────────────────────────────────────────────────────────────────

export const findOneAndDelete = async (
  filter: Record<string, unknown>,
): Promise<TViewDocument | null> => {
  return await View.findOneAndDelete(filter);
};

export const deleteById = async (id: string): Promise<TViewDocument | null> => {
  return await View.findByIdAndDelete(id);
};

export const deleteMany = async (
  filter: Record<string, unknown>,
): Promise<{ deletedCount: number }> => {
  return await View.deleteMany(filter);
};
