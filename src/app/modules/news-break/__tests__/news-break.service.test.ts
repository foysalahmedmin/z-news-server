import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../../builder/app-error';
import * as NewsBreakRepository from '../news-break.repository';
import * as NewsBreakService from '../news-break.service';
import { TNewsBreak } from '../news-break.type';

// Mock the repository
jest.mock('../news-break.repository');
jest.mock('../../../utils/cache.utils', () => ({
  generateCacheKey: jest.fn(),
  invalidateCacheByPattern: jest.fn(),
  withCache: jest.fn((key, ttl, cb) => cb()),
}));

describe('NewsBreak Service', () => {
  const mockUser = { _id: 'user_id', role: 'admin' } as any;
  const mockId = new mongoose.Types.ObjectId().toString();
  const mockNewsId = new mongoose.Types.ObjectId();

  const mockNewsBreak: TNewsBreak = {
    news: mockNewsId,
    status: 'published',
    is_deleted: false,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createNewsBreak', () => {
    it('should create a news break', async () => {
      (NewsBreakRepository.create as jest.Mock).mockResolvedValue(
        mockNewsBreak,
      );

      const result = await NewsBreakService.createNewsBreak(
        mockUser,
        mockNewsBreak,
      );

      expect(NewsBreakRepository.create).toHaveBeenCalledWith(mockNewsBreak);
      expect(result).toEqual(mockNewsBreak);
    });

    it('should throw error if user not provided', async () => {
      await expect(
        NewsBreakService.createNewsBreak(null as any, mockNewsBreak),
      ).rejects.toThrow(new AppError(httpStatus.NOT_FOUND, 'User not found'));
    });
  });

  describe('getNewsBreak', () => {
    it('should return a news break by id', async () => {
      (NewsBreakRepository.findByIdLean as jest.Mock).mockResolvedValue(
        mockNewsBreak,
      );

      const result = await NewsBreakService.getNewsBreak(mockId);

      expect(NewsBreakRepository.findByIdLean).toHaveBeenCalledWith(mockId);
      expect(result).toEqual(mockNewsBreak);
    });

    it('should throw error if news break not found', async () => {
      (NewsBreakRepository.findByIdLean as jest.Mock).mockResolvedValue(null);

      await expect(NewsBreakService.getNewsBreak(mockId)).rejects.toThrow(
        new AppError(httpStatus.NOT_FOUND, 'News-Break not found'),
      );
    });
  });

  describe('updateNewsBreak', () => {
    it('should update a news break', async () => {
      const payload = { status: 'archived' } as any;
      const updatedBreak = {
        ...mockNewsBreak,
        ...payload,
        toObject: () => updatedBreak,
      };
      (NewsBreakRepository.updateById as jest.Mock).mockResolvedValue(
        updatedBreak,
      );

      const result = await NewsBreakService.updateNewsBreak(mockId, payload);

      expect(NewsBreakRepository.updateById).toHaveBeenCalledWith(
        mockId,
        payload,
      );
      expect(result).toEqual(updatedBreak);
    });
  });

  describe('restoreNewsBreak', () => {
    it('should restore a deleted news break', async () => {
      const restoredBreak = { ...mockNewsBreak, toObject: () => restoredBreak };
      (NewsBreakRepository.restoreById as jest.Mock).mockResolvedValue(
        restoredBreak,
      );

      const result = await NewsBreakService.restoreNewsBreak(mockId);

      expect(NewsBreakRepository.restoreById).toHaveBeenCalledWith(mockId);
      expect(result).toEqual(restoredBreak);
    });
  });
});
