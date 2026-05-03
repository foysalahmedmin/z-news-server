/**
 * NewsHeadline Repository
 *
 * Handles ALL direct database interactions for the NewsHeadline module.
 */

import AppQueryFind from '../../builder/app-query-find';
import { NewsHeadline } from './news-headline.model';
import { TNewsHeadline, TNewsHeadlineDocument } from './news-headline.type';

// ─── Create ───────────────────────────────────────────────────────────────────

export const create = async (
  data: Partial<TNewsHeadline>,
): Promise<TNewsHeadline> => {
  const result = await NewsHeadline.create(data);
  return result.toObject();
};

// ─── Find One ────────────────────────────────────────────────────────────────

export const findById = async (
  id: string,
): Promise<TNewsHeadlineDocument | null> => {
  return await NewsHeadline.findById(id).populate([
    { path: 'news', select: '_id title slug' },
  ]);
};

export const findByIdLean = async (
  id: string,
): Promise<TNewsHeadline | null> => {
  return await NewsHeadline.findById(id).lean();
};

// ─── Find Many ────────────────────────────────────────────────────────────────

export const findManyByIds = async (
  ids: string[],
): Promise<TNewsHeadline[]> => {
  return await NewsHeadline.find({ _id: { $in: ids } }).lean();
};

// ─── Paginated Lists ─────────────────────────────────────────────────────────

export const findPaginated = async (
  query: Record<string, unknown>,
  filterOverride: Record<string, unknown> = {},
): Promise<{
  data: TNewsHeadline[];
  meta: { total: number; page: number; limit: number; total_pages: number };
}> => {
  const NewsQuery = new AppQueryFind(NewsHeadline, {
    ...query,
    ...filterOverride,
  })
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
  payload: Partial<TNewsHeadline>,
): Promise<TNewsHeadlineDocument | null> => {
  return await NewsHeadline.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

export const updateManyByIds = async (
  ids: string[],
  payload: Partial<TNewsHeadline>,
): Promise<{ modifiedCount: number }> => {
  return await NewsHeadline.updateMany({ _id: { $in: ids } }, { ...payload });
};

export const restoreById = async (
  id: string,
): Promise<TNewsHeadlineDocument | null> => {
  return await NewsHeadline.findOneAndUpdate(
    { _id: id, is_deleted: true },
    { is_deleted: false },
    { new: true },
  );
};

export const restoreManyByIds = async (
  ids: string[],
): Promise<{ modifiedCount: number }> => {
  return await NewsHeadline.updateMany(
    { _id: { $in: ids }, is_deleted: true },
    { is_deleted: false },
  );
};

// ─── Delete ───────────────────────────────────────────────────────────────────

export const softDeleteManyByIds = async (ids: string[]): Promise<void> => {
  await NewsHeadline.updateMany({ _id: { $in: ids } }, { is_deleted: true });
};

export const hardDeleteById = async (id: string): Promise<void> => {
  await NewsHeadline.findByIdAndDelete(id);
};

export const hardDeleteManyByIds = async (ids: string[]): Promise<void> => {
  await NewsHeadline.deleteMany({ _id: { $in: ids } });
};
