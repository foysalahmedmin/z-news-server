import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../../builder/app-error';
import { TJwtPayload } from '../../../types/jsonwebtoken.type';
import * as NewsBreakRepository from '../news-break.repository';
import * as NewsBreakService from '../news-break.service';
import { TNewsBreak } from '../news-break.type';

// Mock the repository
jest.mock('../news-break.repository');
jest.mock('../../../utils/cache.utils', () => ({
  generateCacheKey: jest.fn(),
  invalidateCacheByPattern: jest.fn(),
  withCache: jest.fn((_key: string, _ttl: number, cb: () => Promise<unknown>) =>
    cb(),
  ),
}));

describe('NewsBreak Service', () => {
  const mockUser: TJwtPayload = {
    _id: 'user_id',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin',
  };
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
        NewsBreakService.createNewsBreak(
          null as unknown as TJwtPayload,
          mockNewsBreak,
        ),
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
      const payload: Partial<TNewsBreak> = { status: 'archived' };
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
