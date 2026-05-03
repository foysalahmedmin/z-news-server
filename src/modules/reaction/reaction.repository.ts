/**
 * Reaction Repository
 *
 * Handles ALL direct database interactions for the Reaction module.
 * The service layer must NEVER import from `reaction.model` directly;
 * it must go through this repository. This ensures:
 *  - Loose coupling between business logic and data access
 *  - Mockable DB layer for unit testing
 *  - A single place to change if the persistence layer changes
 */

import { PopulateOptions } from 'mongoose';
import AppQueryFind from '../../builder/app-query-find';
import { Reaction } from './reaction.model';
import { TReaction, TReactionDocument } from './reaction.type';

type TPopulate = PopulateOptions | (string | PopulateOptions)[];

// ─── Create ───────────────────────────────────────────────────────────────────

export const create = async (
  payload: Partial<TReaction>,
): Promise<TReactionDocument> => {
  return await Reaction.create(payload);
};

// ─── Find One ────────────────────────────────────────────────────────────────

export const findById = async (
  id: string,
): Promise<TReactionDocument | null> => {
  return await Reaction.findById(id);
};

export const findOne = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
): Promise<TReactionDocument | null> => {
  let query = Reaction.findOne(filter);
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return await query;
};

export const findOneLean = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
): Promise<TReaction | null> => {
  let query = Reaction.findOne(filter).lean();
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return (await query) as TReaction | null;
};

export const findByIdLean = async (
  id: string,
  populateFields: TPopulate[] = [],
): Promise<TReaction | null> => {
  let query = Reaction.findById(id).lean();
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return (await query) as TReaction | null;
};

// ─── Find Many / Counts ───────────────────────────────────────────────────────

export const count = async (
  filter: Record<string, unknown>,
): Promise<number> => {
  return await Reaction.countDocuments(filter);
};

export const findManyLean = async (
  filter: Record<string, unknown>,
): Promise<TReaction[]> => {
  return await Reaction.find(filter).lean();
};

// ─── Paginated Lists ─────────────────────────────────────────────────────────

export const findPaginated = async (
  filter: Record<string, unknown>,
  query: Record<string, unknown>,
  populateFields: TPopulate[] = [],
): Promise<{
  data: TReaction[];
  meta: { total: number; page: number; limit: number; total_pages: number };
}> => {
  const reactionQuery = new AppQueryFind(Reaction, { ...filter, ...query })
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  if (populateFields.length > 0) {
    reactionQuery.populate(populateFields as PopulateOptions[]);
  }

  return await reactionQuery.execute();
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateById = async (
  id: string,
  payload: Partial<TReaction>,
): Promise<TReactionDocument | null> => {
  return await Reaction.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

export const updateByIdLean = async (
  id: string,
  payload: Partial<TReaction>,
): Promise<TReaction | null> => {
  return await Reaction.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();
};

export const updateMany = async (
  filter: Record<string, unknown>,
  payload: Partial<TReaction>,
): Promise<{ modifiedCount: number }> => {
  return await Reaction.updateMany(filter, { ...payload });
};

// ─── Delete ──────────────────────────────────────────────────────────────────

export const findOneAndDelete = async (
  filter: Record<string, unknown>,
): Promise<TReactionDocument | null> => {
  return await Reaction.findOneAndDelete(filter);
};

export const deleteById = async (
  id: string,
): Promise<TReactionDocument | null> => {
  return await Reaction.findByIdAndDelete(id);
};

export const deleteMany = async (
  filter: Record<string, unknown>,
): Promise<{ deletedCount: number }> => {
  return await Reaction.deleteMany(filter);
};
