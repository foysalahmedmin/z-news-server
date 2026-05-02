/**
 * Event Repository
 *
 * Handles ALL direct database interactions for the Event module.
 */

import AppQueryFind from '../../builder/app-query-find';
import { Event } from './event.model';
import { TEvent, TEventDocument } from './event.type';

// ─── Create ───────────────────────────────────────────────────────────────────

export const create = async (data: TEvent): Promise<TEvent> => {
  const result = await Event.create(data);
  return result.toObject();
};

// ─── Find One ────────────────────────────────────────────────────────────────

export const findBySlug = async (
  slug: string,
): Promise<TEventDocument | null> => {
  return await Event.findOne({
    slug: slug,
    status: 'active',
  }).populate([{ path: 'category', select: '_id name slug' }]);
};

export const findById = async (id: string): Promise<TEventDocument | null> => {
  return await Event.findById(id).populate([
    { path: 'category', select: '_id name slug' },
  ]);
};

export const findByIdLean = async (id: string): Promise<TEvent | null> => {
  return await Event.findById(id).lean();
};

export const findByIdWithDeleted = async (
  id: string,
): Promise<TEvent | null> => {
  return await Event.findById(id).setOptions({ bypassDeleted: true }).lean();
};

// ─── Find Many ────────────────────────────────────────────────────────────────

export const findManyByIds = async (ids: string[]): Promise<TEvent[]> => {
  return await Event.find({ _id: { $in: ids } }).lean();
};

export const findManyDeletedByIds = async (
  ids: string[],
): Promise<TEvent[]> => {
  return await Event.find({
    _id: { $in: ids },
    is_deleted: true,
  })
    .setOptions({ bypassDeleted: true })
    .lean();
};

// ─── Paginated Lists ─────────────────────────────────────────────────────────

export const findPublicPaginated = async (
  query: Record<string, unknown>,
): Promise<{
  data: TEvent[];
  meta: { total: number; page: number; limit: number };
}> => {
  const { date: q_date, ...rest } = query || {};
  const date = q_date ? new Date(q_date as string) : new Date();

  const filter = {
    status: 'active',
    published_at: { $lte: date },
    $or: [{ expired_at: { $exists: false } }, { expired_at: { $gte: date } }],
  };

  const eventQuery = new AppQueryFind(Event, { ...filter, ...rest })
    .populate([{ path: 'category', select: '_id name slug' }])
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  return await eventQuery.execute();
};

export const findAdminPaginated = async (
  query: Record<string, unknown>,
): Promise<{
  data: TEvent[];
  meta: { total: number; page: number; limit: number };
}> => {
  const eventQuery = new AppQueryFind(Event, query)
    .populate([{ path: 'category', select: '_id name slug' }])
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  return await eventQuery.execute([
    { key: 'active', filter: { status: 'active' } },
    { key: 'inactive', filter: { status: 'inactive' } },
    { key: 'featured', filter: { is_featured: true } },
  ]);
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateById = async (
  id: string,
  payload: Partial<TEvent>,
): Promise<TEventDocument | null> => {
  return await Event.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

export const updateManyByIds = async (
  ids: string[],
  payload: Partial<TEvent>,
): Promise<{ modifiedCount: number }> => {
  return await Event.updateMany({ _id: { $in: ids } }, { ...payload });
};

export const restoreById = async (
  id: string,
): Promise<TEventDocument | null> => {
  return await Event.findOneAndUpdate(
    { _id: id, is_deleted: true },
    { is_deleted: false },
    { new: true },
  );
};

export const restoreManyByIds = async (
  ids: string[],
): Promise<{ modifiedCount: number }> => {
  return await Event.updateMany(
    { _id: { $in: ids }, is_deleted: true },
    { is_deleted: false },
  );
};

export const softDeleteManyByIds = async (ids: string[]): Promise<void> => {
  await Event.updateMany({ _id: { $in: ids } }, { is_deleted: true });
};

// ─── Delete ───────────────────────────────────────────────────────────────────

export const hardDeleteById = async (id: string): Promise<void> => {
  await Event.findByIdAndDelete(id).setOptions({ bypassDeleted: true });
};

export const hardDeleteManyByIds = async (ids: string[]): Promise<void> => {
  await Event.deleteMany({
    _id: { $in: ids },
    is_deleted: true,
  }).setOptions({ bypassDeleted: true });
};

export const findRestoredByIds = async (ids: string[]): Promise<TEvent[]> => {
  return await Event.find({ _id: { $in: ids } }).lean();
};
