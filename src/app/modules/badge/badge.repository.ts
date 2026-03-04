/**
 * Badge Repository
 *
 * Handles ALL direct database interactions for the Badge module.
 */

import { PopulateOptions } from 'mongoose';
import { Badge } from './badge.model';
import { TBadge, TBadgeDocument } from './badge.type';

type TPopulate = string | PopulateOptions | (string | PopulateOptions)[];

// ─── Create ───────────────────────────────────────────────────────────────────

export const create = async (
  payload: Partial<TBadge>,
): Promise<TBadgeDocument> => {
  return await Badge.create(payload);
};

// ─── Find One ────────────────────────────────────────────────────────────────

export const findById = async (
  id: string,
  options: { bypassDeleted?: boolean } = {},
): Promise<TBadgeDocument | null> => {
  const query = Badge.findById(id);
  if (options.bypassDeleted) {
    query.setOptions({ bypassDeleted: true });
  }
  return await query;
};

export const findOne = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
): Promise<TBadgeDocument | null> => {
  let query = Badge.findOne(filter);
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return await query;
};

export const findOneLean = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
): Promise<TBadge | null> => {
  let query = Badge.findOne(filter).lean();
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return (await query) as TBadge | null;
};

// ─── Find Many ───────────────────────────────────────────────────────────────

export const findMany = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
  sort: Record<string, 1 | -1> = {
    category: 1,
    rarity: 1,
  },
): Promise<TBadgeDocument[]> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = Badge.find(filter).sort(sort as any);
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return await query;
};

export const findManyLean = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
  sort: Record<string, 1 | -1> = {
    category: 1,
    rarity: 1,
  },
): Promise<TBadge[]> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sortQuery = sort as any;
  let query = Badge.find(filter).sort(sortQuery).lean();

  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return (await query) as TBadge[];
};

// ─── Delete ──────────────────────────────────────────────────────────────────

export const deleteById = async (
  id: string,
): Promise<TBadgeDocument | null> => {
  return await Badge.findByIdAndDelete(id);
};

// ─── Specialized Methods ─────────────────────────────────────────────────────

export const getActiveBadges = async (): Promise<TBadgeDocument[]> => {
  return await Badge.find({ is_active: true }).sort({ category: 1, rarity: 1 });
};

export const getBadgesByCategory = async (
  category: TBadge['category'],
): Promise<TBadgeDocument[]> => {
  return await Badge.find({ category, is_active: true }).sort({ rarity: 1 });
};
