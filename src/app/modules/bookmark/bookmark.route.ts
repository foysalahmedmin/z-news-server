import { Router } from 'express';
import auth from '../../middlewares/auth.middleware';
import validation from '../../middlewares/validation.middleware';
import { BookmarkController } from './bookmark.controller';
import { BookmarkValidation } from './bookmark.validation';

const router = Router();

// ============ BOOKMARK ROUTES ============

// Create bookmark
router.post(
  '/',
  auth(),
  validation(BookmarkValidation.createBookmarkSchema),
  BookmarkController.createBookmark,
);

// Get my bookmarks
router.get('/', auth(), BookmarkController.getMyBookmarks);

// Get bookmark by ID
router.get('/:bookmarkId', auth(), BookmarkController.getBookmarkById);

// Update bookmark
router.patch(
  '/:bookmarkId',
  auth(),
  validation(BookmarkValidation.updateBookmarkSchema),
  BookmarkController.updateBookmark,
);

// Move bookmark to reading list
router.patch(
  '/:bookmarkId/move',
  auth(),
  validation(BookmarkValidation.moveToReadingListSchema),
  BookmarkController.moveToReadingList,
);

// Delete bookmark
router.delete('/:bookmarkId', auth(), BookmarkController.deleteBookmark);

// ============ READING LIST ROUTES ============

// Create reading list
router.post(
  '/reading-list',
  auth(),
  validation(BookmarkValidation.createReadingListSchema),
  BookmarkController.createReadingList,
);

// Get my reading lists
router.get('/reading-list/my', auth(), BookmarkController.getMyReadingLists);

// Get public reading lists
router.get('/reading-list/public', BookmarkController.getPublicReadingLists);

// Get reading list by ID
router.get('/reading-list/:listId', BookmarkController.getReadingListById);

// Update reading list
router.patch(
  '/reading-list/:listId',
  auth(),
  validation(BookmarkValidation.updateReadingListSchema),
  BookmarkController.updateReadingList,
);

// Delete reading list
router.delete(
  '/reading-list/:listId',
  auth(),
  BookmarkController.deleteReadingList,
);

// Follow reading list
router.post(
  '/reading-list/:listId/follow',
  auth(),
  validation(BookmarkValidation.followReadingListSchema),
  BookmarkController.followReadingList,
);

// Unfollow reading list
router.delete(
  '/reading-list/:listId/follow',
  auth(),
  BookmarkController.unfollowReadingList,
);

const BookmarkRoutes = router;

export default BookmarkRoutes;
