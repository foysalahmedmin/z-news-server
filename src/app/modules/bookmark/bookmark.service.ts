import httpStatus from 'http-status';
import AppError from '../../builder/app-error';
import { News } from '../news/news.model';
import { Bookmark, ReadingList } from './bookmark.model';
import { TBookmark, TReadingList } from './bookmark.type';

// ============ BOOKMARK SERVICES ============

// Create bookmark
const createBookmark = async (userId: string, payload: Partial<TBookmark>) => {
  // Check if news exists
  const news = await News.findById(payload.news);
  if (!news) {
    throw new AppError(httpStatus.NOT_FOUND, 'News article not found');
  }

  // Check if already bookmarked
  const existingBookmark = await Bookmark.isAlreadyBookmarked(
    userId,
    payload.news!.toString(),
  );

  if (existingBookmark) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Article already bookmarked');
  }

  // Create bookmark
  const bookmark = await Bookmark.create({
    user: userId,
    news: payload.news,
    reading_list: payload.reading_list,
    notes: payload.notes,
  });

  // If reading list specified, add bookmark to it
  if (payload.reading_list) {
    await ReadingList.findByIdAndUpdate(payload.reading_list, {
      $addToSet: { bookmarks: bookmark._id },
    });
  }

  return await Bookmark.findById(bookmark._id)
    .populate('news', 'title slug thumbnail description published_at')
    .populate('reading_list', 'name');
};

// Get my bookmarks
const getMyBookmarks = async (userId: string, query: any) => {
  const filter: any = { user: userId };

  if (query.is_read !== undefined) {
    filter.is_read = query.is_read === 'true';
  }

  if (query.reading_list) {
    filter.reading_list = query.reading_list;
  }

  const bookmarks = await Bookmark.find(filter)
    .sort({ created_at: -1 })
    .populate('news', 'title slug thumbnail description published_at category')
    .populate('reading_list', 'name');

  return bookmarks;
};

// Get bookmark by ID
const getBookmarkById = async (bookmarkId: string, userId: string) => {
  const bookmark = await Bookmark.findOne({
    _id: bookmarkId,
    user: userId,
  })
    .populate('news')
    .populate('reading_list', 'name');

  if (!bookmark) {
    throw new AppError(httpStatus.NOT_FOUND, 'Bookmark not found');
  }

  return bookmark;
};

// Update bookmark
const updateBookmark = async (
  bookmarkId: string,
  userId: string,
  payload: Partial<TBookmark>,
) => {
  const bookmark = await Bookmark.findOne({
    _id: bookmarkId,
    user: userId,
  });

  if (!bookmark) {
    throw new AppError(httpStatus.NOT_FOUND, 'Bookmark not found');
  }

  // Update fields
  if (payload.notes !== undefined) bookmark.notes = payload.notes;
  if (payload.is_read !== undefined) {
    bookmark.is_read = payload.is_read;
    if (payload.is_read) {
      bookmark.read_at = new Date();
    }
  }

  await bookmark.save();

  return await Bookmark.findById(bookmark._id)
    .populate('news', 'title slug thumbnail description published_at')
    .populate('reading_list', 'name');
};

// Move bookmark to reading list
const moveToReadingList = async (
  bookmarkId: string,
  userId: string,
  readingListId: string,
) => {
  const bookmark = await Bookmark.findOne({
    _id: bookmarkId,
    user: userId,
  });

  if (!bookmark) {
    throw new AppError(httpStatus.NOT_FOUND, 'Bookmark not found');
  }

  // Check if reading list exists and belongs to user
  const readingList = await ReadingList.findOne({
    _id: readingListId,
    user: userId,
  });

  if (!readingList) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reading list not found');
  }

  // Remove from old list if exists
  if (bookmark.reading_list) {
    await ReadingList.findByIdAndUpdate(bookmark.reading_list, {
      $pull: { bookmarks: bookmark._id },
    });
  }

  // Add to new list
  bookmark.reading_list = readingListId as any;
  await bookmark.save();

  await ReadingList.findByIdAndUpdate(readingListId, {
    $addToSet: { bookmarks: bookmark._id },
  });

  return bookmark;
};

// Delete bookmark
const deleteBookmark = async (bookmarkId: string, userId: string) => {
  const bookmark = await Bookmark.findOne({
    _id: bookmarkId,
    user: userId,
  });

  if (!bookmark) {
    throw new AppError(httpStatus.NOT_FOUND, 'Bookmark not found');
  }

  // Remove from reading list if exists
  if (bookmark.reading_list) {
    await ReadingList.findByIdAndUpdate(bookmark.reading_list, {
      $pull: { bookmarks: bookmark._id },
    });
  }

  await bookmark.softDelete();

  return bookmark;
};

// ============ READING LIST SERVICES ============

// Create reading list
const createReadingList = async (
  userId: string,
  payload: Partial<TReadingList>,
) => {
  const readingList = await ReadingList.create({
    user: userId,
    name: payload.name,
    description: payload.description,
    is_public: payload.is_public || false,
  });

  return readingList;
};

// Get my reading lists
const getMyReadingLists = async (userId: string) => {
  const lists = await ReadingList.find({ user: userId })
    .sort({ created_at: -1 })
    .populate({
      path: 'bookmarks',
      populate: {
        path: 'news',
        select: 'title slug thumbnail description published_at',
      },
    });

  return lists;
};

// Get public reading lists
const getPublicReadingLists = async (limit: number = 20) => {
  const lists = await ReadingList.find({ is_public: true })
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

  return lists;
};

// Get reading list by ID
const getReadingListById = async (listId: string, userId?: string) => {
  const list = await ReadingList.findById(listId)
    .populate('user', 'name email image')
    .populate({
      path: 'bookmarks',
      populate: {
        path: 'news',
        select: 'title slug thumbnail description published_at category',
      },
    });

  if (!list) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reading list not found');
  }

  // Check if user has access (owner or public)
  if (!list.is_public && list.user._id.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You do not have access to this reading list',
    );
  }

  return list;
};

// Update reading list
const updateReadingList = async (
  listId: string,
  userId: string,
  payload: Partial<TReadingList>,
) => {
  const list = await ReadingList.findOne({
    _id: listId,
    user: userId,
  });

  if (!list) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reading list not found');
  }

  if (payload.name !== undefined) list.name = payload.name;
  if (payload.description !== undefined) list.description = payload.description;
  if (payload.is_public !== undefined) list.is_public = payload.is_public;

  await list.save();

  return list;
};

// Delete reading list
const deleteReadingList = async (listId: string, userId: string) => {
  const list = await ReadingList.findOne({
    _id: listId,
    user: userId,
  });

  if (!list) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reading list not found');
  }

  // Remove reading list reference from all bookmarks
  await Bookmark.updateMany(
    { reading_list: listId },
    { $unset: { reading_list: 1 } },
  );

  await list.softDelete();

  return list;
};

// Follow reading list
const followReadingList = async (listId: string, userId: string) => {
  const list = await ReadingList.findById(listId);

  if (!list) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reading list not found');
  }

  if (!list.is_public) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Cannot follow a private reading list',
    );
  }

  // Check if already following
  if (list.followers.includes(userId as any)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Already following this reading list',
    );
  }

  list.followers.push(userId as any);
  await list.save();

  return list;
};

// Unfollow reading list
const unfollowReadingList = async (listId: string, userId: string) => {
  const list = await ReadingList.findById(listId);

  if (!list) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reading list not found');
  }

  list.followers = list.followers.filter((id) => id.toString() !== userId);
  await list.save();

  return list;
};

export const BookmarkService = {
  createBookmark,
  getMyBookmarks,
  getBookmarkById,
  updateBookmark,
  moveToReadingList,
  deleteBookmark,
  createReadingList,
  getMyReadingLists,
  getPublicReadingLists,
  getReadingListById,
  updateReadingList,
  deleteReadingList,
  followReadingList,
  unfollowReadingList,
};
