/**
 * UserProfile Repository
 *
 * Handles ALL direct database interactions for the UserProfile module.
 */

import { PopulateOptions, UpdateQuery } from 'mongoose';
import { UserProfile } from './user-profile.model';
import { TUserProfile, TUserProfileDocument } from './user-profile.type';

type TPopulate = string | PopulateOptions | (string | PopulateOptions)[];

// ─── Create ───────────────────────────────────────────────────────────────────

export const create = async (
  payload: Partial<TUserProfile>,
): Promise<TUserProfileDocument> => {
  return await UserProfile.create(payload);
};

// ─── Find One ────────────────────────────────────────────────────────────────

export const findById = async (
  id: string,
  options: { bypassDeleted?: boolean } = {},
): Promise<TUserProfileDocument | null> => {
  const query = UserProfile.findById(id);
  if (options.bypassDeleted) {
    query.setOptions({ bypassDeleted: true });
  }
  return await query;
};

export const findByUserId = async (
  userId: string,
  populateFields: TPopulate[] = [
    { path: 'user', select: 'name email image role' },
    { path: 'following_authors', select: 'name email image' },
    { path: 'following_categories', select: 'name slug icon' },
    { path: 'badges.badge_id', select: 'name description icon' },
  ],
): Promise<TUserProfileDocument | null> => {
  let query = UserProfile.findOne({ user: userId });
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return await query;
};

export const findOne = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
): Promise<TUserProfileDocument | null> => {
  let query = UserProfile.findOne(filter);
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return await query;
};

// ─── Find Many ───────────────────────────────────────────────────────────────

export const findMany = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
  sort: Record<string, 1 | -1> = { reputation_score: -1 },
  limit: number = 10,
): Promise<TUserProfileDocument[]> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sortQuery = sort as any;
  let query = UserProfile.find(filter).sort(sortQuery).limit(limit);
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return await query;
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const findByIdAndUpdate = async (
  id: string,
  payload: UpdateQuery<TUserProfileDocument>,
): Promise<TUserProfileDocument | null> => {
  return await UserProfile.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

export const findByUserIdAndUpdate = async (
  userId: string,
  payload: UpdateQuery<TUserProfileDocument>,
  options: { upsert?: boolean } = { upsert: true },
): Promise<TUserProfileDocument | null> => {
  return await UserProfile.findOneAndUpdate({ user: userId }, payload, {
    new: true,
    runValidators: true,
    upsert: options.upsert,
  });
};

export const incrementActivityStat = async (
  userId: string,
  stat:
    | 'total_comments'
    | 'total_reactions'
    | 'articles_read'
    | 'reputation_score',
  amount: number = 1,
): Promise<TUserProfileDocument | null> => {
  return await UserProfile.findOneAndUpdate(
    { user: userId },
    { $inc: { [stat]: amount } },
    { new: true, upsert: true },
  );
};

// ─── Delete ──────────────────────────────────────────────────────────────────

export const deleteById = async (
  id: string,
): Promise<TUserProfileDocument | null> => {
  return await UserProfile.findByIdAndDelete(id);
};
