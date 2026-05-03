import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../../builder/app-error';
import { BookmarkService } from '../bookmark.service';
import { TBookmark, TReadingList } from '../bookmark.type';

jest.mock('../bookmark.repository', () => ({
  createBookmark: jest.fn(),
  findBookmarkById: jest.fn(),
  findBookmarkByIdLean: jest.fn(),
  findOneBookmark: jest.fn(),
  findManyBookmarksByIds: jest.fn(),
  findBookmarksByUserId: jest.fn(),
  findBookmarksPaginated: jest.fn(),
  updateBookmarkById: jest.fn(),
  updateManyBookmarksByIds: jest.fn(),
  restoreBookmarkById: jest.fn(),
  restoreManyBookmarksByIds: jest.fn(),
  softDeleteManyBookmarksByIds: jest.fn(),
  hardDeleteBookmarkById: jest.fn(),
  hardDeleteManyBookmarksByIds: jest.fn(),
  createReadingList: jest.fn(),
  findReadingListById: jest.fn(),
  findReadingListByIdLean: jest.fn(),
  findOneReadingList: jest.fn(),
  findManyReadingListsByIds: jest.fn(),
}));

// Mock models used in the service
jest.mock('../../news/news.model', () => ({
  News: {
    findById: jest.fn(),
  },
}));

jest.mock('../bookmark.model', () => ({
  Bookmark: {
    isAlreadyBookmarked: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    updateMany: jest.fn(),
  },
  ReadingList: {
    create: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    updateMany: jest.fn(),
  },
}));

import { News } from '../../news/news.model';
import { Bookmark, ReadingList } from '../bookmark.model';
import * as BookmarkRepository from '../bookmark.repository';

describe('Bookmark Service', () => {
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockNewsId = new mongoose.Types.ObjectId();
  const mockBookmarkId = new mongoose.Types.ObjectId().toString();
  const mockListId = new mongoose.Types.ObjectId().toString();

  const mockBookmark = {
    _id: new mongoose.Types.ObjectId(mockBookmarkId),
    user: new mongoose.Types.ObjectId(mockUserId),
    news: mockNewsId,
    is_read: false,
    is_deleted: false,
    reading_list: undefined as mongoose.Types.ObjectId | undefined,
    notes: undefined as string | undefined,
    save: jest.fn().mockResolvedValue(undefined),
    softDelete: jest.fn().mockResolvedValue(undefined),
    populate: jest.fn().mockReturnThis(),
  };

  const mockReadingList = {
    _id: new mongoose.Types.ObjectId(mockListId),
    user: new mongoose.Types.ObjectId(mockUserId),
    name: 'My List',
    is_public: false,
    bookmarks: [] as mongoose.Types.ObjectId[],
    followers: [] as mongoose.Types.ObjectId[],
    is_deleted: false,
    save: jest.fn().mockResolvedValue(undefined),
    softDelete: jest.fn().mockResolvedValue(undefined),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── BOOKMARK TESTS ────────────────────────────────────────────────────────

  describe('createBookmark', () => {
    it('should create a bookmark successfully', async () => {
      (News.findById as jest.Mock).mockResolvedValue({ _id: mockNewsId });
      (Bookmark.isAlreadyBookmarked as jest.Mock).mockResolvedValue(null);
      (Bookmark.create as jest.Mock).mockResolvedValue(mockBookmark);
      (Bookmark.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockBookmark),
        }),
      });

      const payload: Partial<TBookmark> = { news: mockNewsId };
      const result = await BookmarkService.createBookmark(mockUserId, payload);

      expect(News.findById).toHaveBeenCalledWith(mockNewsId);
      expect(Bookmark.isAlreadyBookmarked).toHaveBeenCalled();
      expect(Bookmark.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw error if news not found', async () => {
      (News.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        BookmarkService.createBookmark(mockUserId, { news: mockNewsId }),
      ).rejects.toThrow(
        new AppError(httpStatus.NOT_FOUND, 'News article not found'),
      );
    });

    it('should throw error if already bookmarked', async () => {
      (News.findById as jest.Mock).mockResolvedValue({ _id: mockNewsId });
      (Bookmark.isAlreadyBookmarked as jest.Mock).mockResolvedValue(
        mockBookmark,
      );

      await expect(
        BookmarkService.createBookmark(mockUserId, { news: mockNewsId }),
      ).rejects.toThrow(
        new AppError(httpStatus.BAD_REQUEST, 'Article already bookmarked'),
      );
    });
  });

  describe('getMyBookmarks', () => {
    it('should return paginated user bookmarks', async () => {
      const mockPaginated = {
        data: [mockBookmark],
        meta: { total: 1, page: 1, limit: 10, total_pages: 1 },
      };
      (BookmarkRepository.findBookmarksPaginated as jest.Mock).mockResolvedValue(mockPaginated);

      const result = await BookmarkService.getMyBookmarks(mockUserId, {});

      expect(BookmarkRepository.findBookmarksPaginated).toHaveBeenCalledWith({}, { user: mockUserId });
      expect(result).toEqual(mockPaginated);
    });
  });

  describe('getBookmarkById', () => {
    it('should return a bookmark by id', async () => {
      (Bookmark.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockBookmark),
        }),
      });

      const result = await BookmarkService.getBookmarkById(
        mockBookmarkId,
        mockUserId,
      );

      expect(result).toEqual(mockBookmark);
    });

    it('should throw error if bookmark not found', async () => {
      (Bookmark.findOne as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(
        BookmarkService.getBookmarkById(mockBookmarkId, mockUserId),
      ).rejects.toThrow(
        new AppError(httpStatus.NOT_FOUND, 'Bookmark not found'),
      );
    });
  });

  describe('deleteBookmark', () => {
    it('should delete a bookmark', async () => {
      (Bookmark.findOne as jest.Mock).mockResolvedValue(mockBookmark);

      const result = await BookmarkService.deleteBookmark(
        mockBookmarkId,
        mockUserId,
      );

      expect(mockBookmark.softDelete).toHaveBeenCalled();
      expect(result).toEqual(mockBookmark);
    });

    it('should throw error if bookmark not found', async () => {
      (Bookmark.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        BookmarkService.deleteBookmark(mockBookmarkId, mockUserId),
      ).rejects.toThrow(
        new AppError(httpStatus.NOT_FOUND, 'Bookmark not found'),
      );
    });
  });

  // ── READING LIST TESTS ────────────────────────────────────────────────────

  describe('createReadingList', () => {
    it('should create a reading list', async () => {
      (ReadingList.create as jest.Mock).mockResolvedValue(mockReadingList);

      const payload: Partial<TReadingList> = {
        name: 'My List',
        is_public: false,
      };
      const result = await BookmarkService.createReadingList(
        mockUserId,
        payload,
      );

      expect(ReadingList.create).toHaveBeenCalled();
      expect(result).toEqual(mockReadingList);
    });
  });

  describe('getMyReadingLists', () => {
    it('should return user reading lists', async () => {
      (ReadingList.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue([mockReadingList]),
        }),
      });

      const result = await BookmarkService.getMyReadingLists(mockUserId);

      expect(ReadingList.find).toHaveBeenCalledWith({ user: mockUserId });
      expect(result).toEqual([mockReadingList]);
    });
  });

  describe('getReadingListById', () => {
    it('should return a reading list by id', async () => {
      const populatedList = {
        ...mockReadingList,
        user: { _id: new mongoose.Types.ObjectId(mockUserId) },
        is_public: true,
      };
      (ReadingList.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(populatedList),
        }),
      });

      const result = await BookmarkService.getReadingListById(
        mockListId,
        mockUserId,
      );

      expect(result).toBeDefined();
    });

    it('should throw error if reading list not found', async () => {
      (ReadingList.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(
        BookmarkService.getReadingListById(mockListId, mockUserId),
      ).rejects.toThrow(
        new AppError(httpStatus.NOT_FOUND, 'Reading list not found'),
      );
    });
  });

  describe('deleteReadingList', () => {
    it('should delete a reading list', async () => {
      (ReadingList.findOne as jest.Mock).mockResolvedValue(mockReadingList);
      (Bookmark.updateMany as jest.Mock).mockResolvedValue({
        modifiedCount: 0,
      });

      const result = await BookmarkService.deleteReadingList(
        mockListId,
        mockUserId,
      );

      expect(mockReadingList.softDelete).toHaveBeenCalled();
      expect(result).toEqual(mockReadingList);
    });

    it('should throw error if reading list not found', async () => {
      (ReadingList.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        BookmarkService.deleteReadingList(mockListId, mockUserId),
      ).rejects.toThrow(
        new AppError(httpStatus.NOT_FOUND, 'Reading list not found'),
      );
    });
  });
});
