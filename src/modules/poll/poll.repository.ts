/**
 * Poll Repository
 *
 * Handles ALL direct database interactions for the Poll module.
 */

import { PopulateOptions } from 'mongoose';
import { Poll } from './poll.model';
import { TPoll, TPollDocument } from './poll.type';

type TPopulate = string | PopulateOptions | (string | PopulateOptions)[];

// ─── Create ───────────────────────────────────────────────────────────────────

export const create = async (
  payload: Partial<TPoll>,
): Promise<TPollDocument> => {
  return await Poll.create(payload);
};

// ─── Find One ────────────────────────────────────────────────────────────────

export const findById = async (
  id: string,
  options: { bypassDeleted?: boolean } = {},
): Promise<TPollDocument | null> => {
  const query = Poll.findById(id);
  if (options.bypassDeleted) {
    query.setOptions({ bypassDeleted: true });
  }
  return await query;
};

export const findOne = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
): Promise<TPollDocument | null> => {
  let query = Poll.findOne(filter);
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return await query;
};

// ─── Find Many ───────────────────────────────────────────────────────────────

export const findMany = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
  sort: Record<string, 1 | -1> = { created_at: -1 },
): Promise<TPollDocument[]> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sortQuery = sort as any;
  let query = Poll.find(filter).sort(sortQuery);
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return await query;
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const findByIdAndUpdate = async (
  id: string,
  payload: Partial<TPoll>,
): Promise<TPollDocument | null> => {
  return await Poll.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

export const save = async (doc: TPollDocument): Promise<TPollDocument> => {
  return await doc.save();
};

export const deleteMany = async (
  filter: Record<string, unknown>,
): Promise<{ deletedCount: number }> => {
  const query = Poll.deleteMany(filter);
  if (filter.is_deleted === true) {
    query.setOptions({ bypassDeleted: true });
  }
  return await query;
};

// ─── Specialized Methods ─────────────────────────────────────────────────────

export const getActivePolls = async (): Promise<TPollDocument[] | null> => {
  return await Poll.getActivePolls();
};

export const getFeaturedPolls = async (
  limit: number = 5,
): Promise<TPollDocument[] | null> => {
  return await Poll.getFeaturedPolls(limit);
};

export const hasUserVoted = async (
  pollId: string,
  userId: string,
): Promise<boolean> => {
  return await Poll.hasUserVoted(pollId, userId);
};
