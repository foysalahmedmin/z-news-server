import httpStatus from 'http-status';
import { BookmarkService } from './bookmark.service';
import catchAsync from '../../utils/catch-async';
import sendResponse from '../../utils/send-response';

// ============ BOOKMARK CONTROLLERS ============

// Create bookmark
const createBookmark = catchAsync(async (req, res) => {
  const userId = req.user?._id;

  const bookmark = await BookmarkService.createBookmark(userId, req.body);

  sendResponse(res, {
    success: true,
    status: httpStatus.CREATED,
    message: 'Bookmark created successfully',
    data: bookmark,
  });
});

// Get my bookmarks
const getMyBookmarks = catchAsync(async (req, res) => {
  const userId = req.user?._id;

  const bookmarks = await BookmarkService.getMyBookmarks(userId, req.query);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Bookmarks retrieved successfully',
    data: bookmarks,
  });
});

// Get bookmark by ID
const getBookmarkById = catchAsync(async (req, res) => {
  const userId = req.user?._id;
  const { bookmarkId } = req.params;

  const bookmark = await BookmarkService.getBookmarkById(bookmarkId, userId);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Bookmark retrieved successfully',
    data: bookmark,
  });
});

// Update bookmark
const updateBookmark = catchAsync(async (req, res) => {
  const userId = req.user?._id;
  const { bookmarkId } = req.params;

  const bookmark = await BookmarkService.updateBookmark(
    bookmarkId,
    userId,
    req.body,
  );

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Bookmark updated successfully',
    data: bookmark,
  });
});

// Move bookmark to reading list
const moveToReadingList = catchAsync(async (req, res) => {
  const userId = req.user?._id;
  const { bookmarkId } = req.params;
  const { reading_list_id } = req.body;

  const bookmark = await BookmarkService.moveToReadingList(
    bookmarkId,
    userId,
    reading_list_id,
  );

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Bookmark moved successfully',
    data: bookmark,
  });
});

// Delete bookmark
const deleteBookmark = catchAsync(async (req, res) => {
  const userId = req.user?._id;
  const { bookmarkId } = req.params;

  await BookmarkService.deleteBookmark(bookmarkId, userId);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Bookmark deleted successfully',
    data: null,
  });
});

// ============ READING LIST CONTROLLERS ============

// Create reading list
const createReadingList = catchAsync(async (req, res) => {
  const userId = req.user?._id;

  const list = await BookmarkService.createReadingList(userId, req.body);

  sendResponse(res, {
    success: true,
    status: httpStatus.CREATED,
    message: 'Reading list created successfully',
    data: list,
  });
});

// Get my reading lists
const getMyReadingLists = catchAsync(async (req, res) => {
  const userId = req.user?._id;

  const lists = await BookmarkService.getMyReadingLists(userId);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Reading lists retrieved successfully',
    data: lists,
  });
});

// Get public reading lists
const getPublicReadingLists = catchAsync(async (req, res) => {
  const limit = Number(req.query.limit) || 20;

  const lists = await BookmarkService.getPublicReadingLists(limit);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Public reading lists retrieved successfully',
    data: lists,
  });
});

// Get reading list by ID
const getReadingListById = catchAsync(async (req, res) => {
  const userId = req.user?._id;
  const { listId } = req.params;

  const list = await BookmarkService.getReadingListById(listId, userId);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Reading list retrieved successfully',
    data: list,
  });
});

// Update reading list
const updateReadingList = catchAsync(async (req, res) => {
  const userId = req.user?._id;
  const { listId } = req.params;

  const list = await BookmarkService.updateReadingList(
    listId,
    userId,
    req.body,
  );

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Reading list updated successfully',
    data: list,
  });
});

// Delete reading list
const deleteReadingList = catchAsync(async (req, res) => {
  const userId = req.user?._id;
  const { listId } = req.params;

  await BookmarkService.deleteReadingList(listId, userId);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Reading list deleted successfully',
    data: null,
  });
});

// Follow reading list
const followReadingList = catchAsync(async (req, res) => {
  const userId = req.user?._id;
  const { listId } = req.params;

  const list = await BookmarkService.followReadingList(listId, userId);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Reading list followed successfully',
    data: list,
  });
});

// Unfollow reading list
const unfollowReadingList = catchAsync(async (req, res) => {
  const userId = req.user?._id;
  const { listId } = req.params;

  const list = await BookmarkService.unfollowReadingList(listId, userId);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Reading list unfollowed successfully',
    data: list,
  });
});

export const BookmarkController = {
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
