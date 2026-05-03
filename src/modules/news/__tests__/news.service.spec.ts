import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../../builder/app-error';
import { TJwtPayload } from '../../../types/jsonwebtoken.type';
import * as NewsRepository from '../news.repository';
import * as NewsService from '../news.service';
import { TNews } from '../news.type';

// Mock the repository with explicit factory to avoid loading mongoose models
jest.mock('../news.repository', () => ({
  create: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  findOneLean: jest.fn(),
  findMany: jest.fn(),
  findManyLean: jest.fn(),
  findPublicPaginated: jest.fn(),
  findSelfPaginated: jest.fn(),
  findAdminPaginated: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  updateOne: jest.fn(),
  updateMany: jest.fn(),
  restoreById: jest.fn(),
  restoreManyByIds: jest.fn(),
  deleteById: jest.fn(),
  deleteMany: jest.fn(),
}));
jest.mock('../../../utils/cache.utils', () => ({
  generateCacheKey: jest.fn(),
  invalidateCacheByPattern: jest.fn(),
  withCache: jest.fn((_key: string, _ttl: number, cb: () => Promise<unknown>) =>
    cb(),
  ),
}));
// Mock heavy cross-module dependencies
jest.mock('../../article-version/article-version.service', () => ({
  ArticleVersionService: { createVersion: jest.fn() },
}));
jest.mock('../../notification/notification.service', () => ({
  sendNewsNotification: jest.fn(),
}));
jest.mock('../../file/file.service', () => ({
  deleteFilePermanent: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../category/category.model', () => ({
  Category: { aggregate: jest.fn().mockResolvedValue([]) },
}));
jest.mock('../../article-version/article-version.model', () => ({
  ArticleVersion: { deleteMany: jest.fn().mockResolvedValue(undefined) },
}));
jest.mock('../../bookmark/bookmark.model', () => ({
  Bookmark: { deleteMany: jest.fn().mockResolvedValue(undefined) },
}));
jest.mock('../../comment/comment.model', () => ({
  Comment: { deleteMany: jest.fn().mockResolvedValue(undefined) },
}));
jest.mock('../../reaction/reaction.model', () => ({
  Reaction: { deleteMany: jest.fn().mockResolvedValue(undefined) },
}));
jest.mock('../../poll/poll.model', () => ({
  Poll: { deleteMany: jest.fn().mockResolvedValue(undefined) },
}));

describe('News Service', () => {
  const mockUser: TJwtPayload = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin',
  };
  const mockId = new mongoose.Types.ObjectId().toString();

  const mockNews: TNews = {
    title: 'Test News',
    slug: 'test-news',
    content: '<p>Content</p>',
    author: new mongoose.Types.ObjectId(mockUser._id),
    status: 'draft',
    content_type: 'article',
    sensitivity_level: 'public',
    is_deleted: false,
  };

  const mockNewsDoc = {
    ...mockNews,
    _id: new mongoose.Types.ObjectId(),
    toObject: () => mockNews,
    softDelete: jest.fn(),
    populate: jest.fn().mockReturnThis(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createNews', () => {
    it('should create a news article', async () => {
      (NewsRepository.create as jest.Mock).mockResolvedValue(mockNewsDoc);

      const result = await NewsService.createNews(mockUser, mockNews);

      expect(NewsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ author: mockUser._id }),
      );
      expect(result).toEqual(mockNews);
    });
  });

  describe('getNews', () => {
    it('should return a news article by id', async () => {
      (NewsRepository.findOneLean as jest.Mock).mockResolvedValue(mockNews);

      const result = await NewsService.getNews(mockId);

      expect(NewsRepository.findOneLean).toHaveBeenCalledWith(
        { _id: mockId },
        expect.any(Array),
      );
      expect(result).toEqual(mockNews);
    });

    it('should throw error if news not found', async () => {
      (NewsRepository.findOneLean as jest.Mock).mockResolvedValue(null);

      await expect(NewsService.getNews(mockId)).rejects.toThrow(
        new AppError(httpStatus.NOT_FOUND, 'News not found'),
      );
    });
  });

  describe('getPublicNews', () => {
    it('should return a published news article by slug', async () => {
      (NewsRepository.findOneLean as jest.Mock).mockResolvedValue(mockNews);

      const result = await NewsService.getPublicNews('test-news');

      expect(NewsRepository.findOneLean).toHaveBeenCalledWith(
        { slug: 'test-news', status: 'published' },
        expect.any(Array),
      );
      expect(result).toEqual(mockNews);
    });

    it('should throw error if published news not found', async () => {
      (NewsRepository.findOneLean as jest.Mock).mockResolvedValue(null);

      await expect(NewsService.getPublicNews('non-existent')).rejects.toThrow(
        new AppError(httpStatus.NOT_FOUND, 'News not found'),
      );
    });
  });

  describe('deleteNews', () => {
    it('should soft delete a news article', async () => {
      (NewsRepository.findById as jest.Mock).mockResolvedValue(mockNewsDoc);

      await NewsService.deleteNews(mockId);

      expect(NewsRepository.findById).toHaveBeenCalledWith(mockId);
      expect(mockNewsDoc.softDelete).toHaveBeenCalled();
    });

    it('should throw error if news not found', async () => {
      (NewsRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(NewsService.deleteNews(mockId)).rejects.toThrow(
        new AppError(httpStatus.NOT_FOUND, 'News not found'),
      );
    });
  });

  describe('updateNews', () => {
    it('should update a news article', async () => {
      (NewsRepository.findOneLean as jest.Mock).mockResolvedValue(mockNews);
      (NewsRepository.findManyLean as jest.Mock).mockResolvedValue([]);
      (NewsRepository.findByIdAndUpdate as jest.Mock).mockResolvedValue(
        mockNewsDoc,
      );

      const result = await NewsService.updateNews(mockUser, mockId, {
        title: 'Updated Title',
      });

      expect(NewsRepository.findOneLean).toHaveBeenCalledWith({ _id: mockId });
      expect(result).toBeDefined();
    });

    it('should throw error if news not found', async () => {
      (NewsRepository.findOneLean as jest.Mock).mockResolvedValue(null);

      await expect(
        NewsService.updateNews(mockUser, mockId, { title: 'Updated' }),
      ).rejects.toThrow(new AppError(httpStatus.NOT_FOUND, 'News not found'));
    });
  });
});
