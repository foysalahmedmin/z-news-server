/**
 * NewsBreak Repository
 *
 * Handles ALL direct database interactions for the NewsBreak module.
 */

import AppQueryFind from '../../builder/app-query-find';
import { NewsBreak } from './news-break.model';
import { TNewsBreak, TNewsBreakDocument } from './news-break.type';

// ─── Create ───────────────────────────────────────────────────────────────────

export const create = async (
  data: Partial<TNewsBreak>,
): Promise<TNewsBreak> => {
  const result = await NewsBreak.create(data);
  return result.toObject();
};

// ─── Find One ────────────────────────────────────────────────────────────────

export const findById = async (
  id: string,
): Promise<TNewsBreakDocument | null> => {
  return await NewsBreak.findById(id).populate([
    { path: 'news', select: '_id title slug' },
  ]);
};

export const findByIdLean = async (id: string): Promise<TNewsBreak | null> => {
  return await NewsBreak.findById(id).lean();
};

// ─── Find Many ────────────────────────────────────────────────────────────────

export const findManyByIds = async (ids: string[]): Promise<TNewsBreak[]> => {
  return await NewsBreak.find({ _id: { $in: ids } }).lean();
};

// ─── Paginated Lists ─────────────────────────────────────────────────────────

export const findPaginated = async (
  query: Record<string, unknown>,
  filterOverride: Record<string, unknown> = {},
): Promise<{
  data: TNewsBreak[];
  meta: { total: number; page: number; limit: number; total_pages: number };
}> => {
  const NewsQuery = new AppQueryFind(NewsBreak, { ...query, ...filterOverride })
    .populate([{ path: 'news', select: '_id title slug' }])
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  return await NewsQuery.execute();
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateById = async (
  id: string,
  payload: Partial<TNewsBreak>,
): Promise<TNewsBreakDocument | null> => {
  return await NewsBreak.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

export const updateManyByIds = async (
  ids: string[],
  payload: Partial<TNewsBreak>,
): Promise<{ modifiedCount: number }> => {
  return await NewsBreak.updateMany({ _id: { $in: ids } }, { ...payload });
};

export const restoreById = async (
  id: string,
): Promise<TNewsBreakDocument | null> => {
  return await NewsBreak.findOneAndUpdate(
    { _id: id, is_deleted: true },
    { is_deleted: false },
    { new: true },
  );
};

export const restoreManyByIds = async (
  ids: string[],
): Promise<{ modifiedCount: number }> => {
  return await NewsBreak.updateMany(
    { _id: { $in: ids }, is_deleted: true },
    { is_deleted: false },
  );
};

// ─── Delete ───────────────────────────────────────────────────────────────────

export const softDeleteManyByIds = async (ids: string[]): Promise<void> => {
  await NewsBreak.updateMany({ _id: { $in: ids } }, { is_deleted: true });
};

export const hardDeleteById = async (id: string): Promise<void> => {
  await NewsBreak.findByIdAndDelete(id);
};

export const hardDeleteManyByIds = async (ids: string[]): Promise<void> => {
  await NewsBreak.deleteMany({ _id: { $in: ids } });
};
