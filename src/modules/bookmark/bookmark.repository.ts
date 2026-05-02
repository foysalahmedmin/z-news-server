/**
 * Bookmark Repository
 *
 * Handles ALL direct database interactions for the Bookmark and ReadingList modules.
 */

import AppQueryFind from '../../builder/app-query-find';
import { Bookmark, ReadingList } from './bookmark.model';
import {
  TBookmark,
  TBookmarkDocument,
  TReadingList,
  TReadingListDocument,
} from './bookmark.type';

// ─────────────────────────────────────────────────────────────────────────────
// BOOKMARK REPOSITORY
// ─────────────────────────────────────────────────────────────────────────────

// ─── Create ──────────────────────────────────────────────────────────────────

export const createBookmark = async (
  data: Partial<TBookmark>,
): Promise<TBookmark> => {
  const result = await Bookmark.create(data);
  return result.toObject();
};

// ─── Find One ─────────────────────────────────────────────────────────────────

export const findBookmarkById = async (
  id: string,
): Promise<TBookmarkDocument | null> => {
  return await Bookmark.findById(id)
    .populate('news', 'title slug thumbnail description published_at')
    .populate('reading_list', 'name');
};

export const findBookmarkByIdLean = async (
  id: string,
): Promise<TBookmark | null> => {
  return await Bookmark.findById(id).lean();
};

export const findOneBookmark = async (
  filter: Record<string, unknown>,
): Promise<TBookmarkDocument | null> => {
  return await Bookmark.findOne(filter)
    .populate('news', 'title slug thumbnail description published_at')
    .populate('reading_list', 'name');
};

// ─── Find Many ────────────────────────────────────────────────────────────────

export const findManyBookmarksByIds = async (
  ids: string[],
): Promise<TBookmark[]> => {
  return await Bookmark.find({ _id: { $in: ids } }).lean();
};

export const findBookmarksByUserId = async (
  userId: string,
  filter: Record<string, unknown> = {},
): Promise<TBookmarkDocument[]> => {
  return await Bookmark.find({ user: userId, ...filter })
    .sort({ created_at: -1 })
    .populate('news', 'title slug thumbnail description published_at category')
    .populate('reading_list', 'name');
};

// ─── Paginated Lists ──────────────────────────────────────────────────────────

export const findBookmarksPaginated = async (
  query: Record<string, unknown>,
  filterOverride: Record<string, unknown> = {},
): Promise<{
  data: TBookmark[];
  meta: { total: number; page: number; limit: number };
}> => {
  const BookmarkQuery = new AppQueryFind(Bookmark, {
    ...query,
    ...filterOverride,
  })
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  return await BookmarkQuery.execute();
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateBookmarkById = async (
  id: string,
  payload: Partial<TBookmark>,
): Promise<TBookmarkDocument | null> => {
  return await Bookmark.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

export const updateManyBookmarksByIds = async (
  ids: string[],
  payload: Partial<TBookmark>,
): Promise<{ modifiedCount: number }> => {
  return await Bookmark.updateMany({ _id: { $in: ids } }, { ...payload });
};

export const restoreBookmarkById = async (
  id: string,
): Promise<TBookmarkDocument | null> => {
  return await Bookmark.findOneAndUpdate(
    { _id: id, is_deleted: true },
    { is_deleted: false },
    { new: true },
  );
};

export const restoreManyBookmarksByIds = async (
  ids: string[],
): Promise<{ modifiedCount: number }> => {
  return await Bookmark.updateMany(
    { _id: { $in: ids }, is_deleted: true },
    { is_deleted: false },
  );
};

// ─── Delete ───────────────────────────────────────────────────────────────────

export const softDeleteManyBookmarksByIds = async (
  ids: string[],
): Promise<void> => {
  await Bookmark.updateMany({ _id: { $in: ids } }, { is_deleted: true });
};

export const hardDeleteBookmarkById = async (id: string): Promise<void> => {
  await Bookmark.findByIdAndDelete(id);
};

export const hardDeleteManyBookmarksByIds = async (
  ids: string[],
): Promise<void> => {
  await Bookmark.deleteMany({ _id: { $in: ids } });
};

// ─────────────────────────────────────────────────────────────────────────────
// READING LIST REPOSITORY
// ─────────────────────────────────────────────────────────────────────────────

// ─── Create ───────────────────────────────────────────────────────────────────

export const createReadingList = async (
  data: Partial<TReadingList>,
): Promise<TReadingList> => {
  const result = await ReadingList.create(data);
  return result.toObject();
};

// ─── Find One ─────────────────────────────────────────────────────────────────

export const findReadingListById = async (
  id: string,
): Promise<TReadingListDocument | null> => {
  return await ReadingList.findById(id)
    .populate('user', 'name email image')
    .populate({
      path: 'bookmarks',
      populate: {
        path: 'news',
        select: 'title slug thumbnail description published_at category',
      },
    });
};

export const findReadingListByIdLean = async (
  id: string,
): Promise<TReadingList | null> => {
  return await ReadingList.findById(id).lean();
};

export const findOneReadingList = async (
  filter: Record<string, unknown>,
): Promise<TReadingListDocument | null> => {
  return await ReadingList.findOne(filter);
};

// ─── Find Many ────────────────────────────────────────────────────────────────

export const findManyReadingListsByIds = async (
  ids: string[],
): Promise<TReadingList[]> => {
  return await ReadingList.find({ _id: { $in: ids } }).lean();
};

export const findReadingListsByUserId = async (
  userId: string,
): Promise<TReadingListDocument[]> => {
  return await ReadingList.find({ user: userId })
    .sort({ created_at: -1 })
    .populate({
      path: 'bookmarks',
      populate: {
        path: 'news',
        select: 'title slug thumbnail description published_at',
      },
    });
};

export const findPublicReadingLists = async (
  limit: number = 20,
): Promise<TReadingListDocument[]> => {
  return await ReadingList.find({ is_public: true })
    .sort({ created_at: -1 })
    .limit(limit)
    .populate('user', 'name email image')
    .populate({
      path: 'bookmarks',
      populate: {
        path: 'news',
        select: 'title slug thumbnail description published_at',
      },
    });
};

// ─── Paginated Lists ──────────────────────────────────────────────────────────

export const findReadingListsPaginated = async (
  query: Record<string, unknown>,
  filterOverride: Record<string, unknown> = {},
): Promise<{
  data: TReadingList[];
  meta: { total: number; page: number; limit: number };
}> => {
  const ReadingListQuery = new AppQueryFind(ReadingList, {
    ...query,
    ...filterOverride,
  })
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  return await ReadingListQuery.execute();
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateReadingListById = async (
  id: string,
  payload: Partial<TReadingList>,
): Promise<TReadingListDocument | null> => {
  return await ReadingList.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

export const updateManyReadingListsByIds = async (
  ids: string[],
  payload: Partial<TReadingList>,
): Promise<{ modifiedCount: number }> => {
  return await ReadingList.updateMany({ _id: { $in: ids } }, { ...payload });
};

export const restoreReadingListById = async (
  id: string,
): Promise<TReadingListDocument | null> => {
  return await ReadingList.findOneAndUpdate(
    { _id: id, is_deleted: true },
    { is_deleted: false },
    { new: true },
  );
};

export const restoreManyReadingListsByIds = async (
  ids: string[],
): Promise<{ modifiedCount: number }> => {
  return await ReadingList.updateMany(
    { _id: { $in: ids }, is_deleted: true },
    { is_deleted: false },
  );
};

// ─── Delete ───────────────────────────────────────────────────────────────────

export const softDeleteManyReadingListsByIds = async (
  ids: string[],
): Promise<void> => {
  await ReadingList.updateMany({ _id: { $in: ids } }, { is_deleted: true });
};

export const hardDeleteReadingListById = async (id: string): Promise<void> => {
  await ReadingList.findByIdAndDelete(id);
};

export const hardDeleteManyReadingListsByIds = async (
  ids: string[],
): Promise<void> => {
  await ReadingList.deleteMany({ _id: { $in: ids } });
};
