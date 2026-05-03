import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../../builder/app-error';
import { TJwtPayload } from '../../../types/jsonwebtoken.type';
import * as NewsRepository from '../news.repository';
import * as NewsService from '../news.service';
import { TNews } from '../news.type';

// Mock the repository
jest.mock('../news.repository');
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

describe('News Service', () => {
  const mockUser: TJwtPayload = {
    _id: 'user_id',
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
