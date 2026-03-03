import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../../builder/app-error';
import * as NewsHeadlineRepository from '../news-headline.repository';
import * as NewsHeadlineService from '../news-headline.service';
import { TNewsHeadline } from '../news-headline.type';

// Mock the repository
jest.mock('../news-headline.repository');
jest.mock('../../../utils/cache.utils', () => ({
  generateCacheKey: jest.fn(),
  invalidateCacheByPattern: jest.fn(),
  withCache: jest.fn((key, ttl, cb) => cb()),
}));

describe('NewsHeadline Service', () => {
  const mockUser = { _id: 'user_id', role: 'admin' } as any;
  const mockId = new mongoose.Types.ObjectId().toString();
  const mockNewsId = new mongoose.Types.ObjectId();

  const mockNewsHeadline: TNewsHeadline = {
    news: mockNewsId,
    status: 'published',
    is_deleted: false,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createNewsHeadline', () => {
    it('should create a news headline', async () => {
      (NewsHeadlineRepository.create as jest.Mock).mockResolvedValue(
        mockNewsHeadline,
      );

      const result = await NewsHeadlineService.createNewsHeadline(
        mockUser,
        mockNewsHeadline,
      );

      expect(NewsHeadlineRepository.create).toHaveBeenCalledWith(
        mockNewsHeadline,
      );
      expect(result).toEqual(mockNewsHeadline);
    });

    it('should throw error if user not provided', async () => {
      await expect(
        NewsHeadlineService.createNewsHeadline(null as any, mockNewsHeadline),
      ).rejects.toThrow(new AppError(httpStatus.NOT_FOUND, 'User not found'));
    });
  });

  describe('getNewsHeadline', () => {
    it('should return a news headline by id', async () => {
      (NewsHeadlineRepository.findByIdLean as jest.Mock).mockResolvedValue(
        mockNewsHeadline,
      );

      const result = await NewsHeadlineService.getNewsHeadline(mockId);

      expect(NewsHeadlineRepository.findByIdLean).toHaveBeenCalledWith(mockId);
      expect(result).toEqual(mockNewsHeadline);
    });

    it('should throw error if news headline not found', async () => {
      (NewsHeadlineRepository.findByIdLean as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(NewsHeadlineService.getNewsHeadline(mockId)).rejects.toThrow(
        new AppError(httpStatus.NOT_FOUND, 'News-Headline not found'),
      );
    });
  });

  describe('updateNewsHeadline', () => {
    it('should update a news headline', async () => {
      const payload = { status: 'archived' } as any;
      const updatedHeadline = {
        ...mockNewsHeadline,
        ...payload,
        toObject: () => updatedHeadline,
      };
      (NewsHeadlineRepository.updateById as jest.Mock).mockResolvedValue(
        updatedHeadline,
      );

      const result = await NewsHeadlineService.updateNewsHeadline(
        mockId,
        payload,
      );

      expect(NewsHeadlineRepository.updateById).toHaveBeenCalledWith(
        mockId,
        payload,
      );
      expect(result).toEqual(updatedHeadline);
    });
  });

  describe('restoreNewsHeadline', () => {
    it('should restore a deleted news headline', async () => {
      const restoredHeadline = {
        ...mockNewsHeadline,
        toObject: () => restoredHeadline,
      };
      (NewsHeadlineRepository.restoreById as jest.Mock).mockResolvedValue(
        restoredHeadline,
      );

      const result = await NewsHeadlineService.restoreNewsHeadline(mockId);

      expect(NewsHeadlineRepository.restoreById).toHaveBeenCalledWith(mockId);
      expect(result).toEqual(restoredHeadline);
    });
  });
});
