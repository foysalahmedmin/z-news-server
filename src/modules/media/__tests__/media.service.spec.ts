import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../../builder/app-error';
import { TJwtPayload } from '../../../types/jsonwebtoken.type';
import * as MediaRepository from '../media.repository';
import * as MediaService from '../media.service';
import { TMedia } from '../media.type';

// Mock the repository
jest.mock('../media.repository');

describe('Media Service', () => {
  const mockUser: TJwtPayload = {
    _id: 'user_id',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin',
  };
  const mockId = new mongoose.Types.ObjectId().toString();

  const mockMedia: TMedia = {
    title: 'Test Image',
    description: 'A test image',
    file: new mongoose.Types.ObjectId(),
    type: 'image',
    url: 'https://example.com/image.jpg',
    status: 'active',
    tags: ['test'],
    uploaded_by: new mongoose.Types.ObjectId(mockUser._id),
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockMediaDoc = {
    ...mockMedia,
    _id: new mongoose.Types.ObjectId(),
    toObject: () => mockMedia,
    softDelete: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMedia', () => {
    it('should create a media record', async () => {
      (MediaRepository.create as jest.Mock).mockResolvedValue(mockMediaDoc);

      const result = await MediaService.createMedia(mockUser, mockMedia);

      expect(MediaRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          uploaded_by: expect.any(mongoose.Types.ObjectId),
        }),
      );
      expect(result).toEqual(mockMedia);
    });
  });

  describe('getMedia', () => {
    it('should return a media by id', async () => {
      (MediaRepository.findOneLean as jest.Mock).mockResolvedValue(mockMedia);

      const result = await MediaService.getMedia(mockId);

      expect(MediaRepository.findOneLean).toHaveBeenCalledWith(
        { _id: mockId },
        expect.any(Array),
      );
      expect(result).toEqual(mockMedia);
    });

    it('should throw error if media not found', async () => {
      (MediaRepository.findOneLean as jest.Mock).mockResolvedValue(null);

      await expect(MediaService.getMedia(mockId)).rejects.toThrow(
        new AppError(httpStatus.NOT_FOUND, 'Media not found'),
      );
    });
  });

  describe('getBulkMedia', () => {
    it('should return paginated media', async () => {
      const paginatedResult = {
        data: [mockMedia],
        meta: { total: 1, page: 1, limit: 10 },
      };
      (MediaRepository.findPaginated as jest.Mock).mockResolvedValue(
        paginatedResult,
      );

      const result = await MediaService.getBulkMedia({});

      expect(MediaRepository.findPaginated).toHaveBeenCalled();
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('updateMedia', () => {
    it('should update a media record', async () => {
      (MediaRepository.findById as jest.Mock).mockResolvedValue(mockMediaDoc);
      (MediaRepository.findByIdAndUpdate as jest.Mock).mockResolvedValue(
        mockMediaDoc,
      );

      const result = await MediaService.updateMedia(mockId, {
        title: 'Updated',
      });

      expect(MediaRepository.findById).toHaveBeenCalledWith(mockId);
      expect(MediaRepository.findByIdAndUpdate).toHaveBeenCalledWith(mockId, {
        title: 'Updated',
      });
      expect(result).toEqual(mockMedia);
    });

    it('should throw error if media not found', async () => {
      (MediaRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        MediaService.updateMedia(mockId, { title: 'Updated' }),
      ).rejects.toThrow(new AppError(httpStatus.NOT_FOUND, 'Media not found'));
    });
  });

  describe('deleteMedia', () => {
    it('should soft delete a media record', async () => {
      (MediaRepository.findOne as jest.Mock).mockResolvedValue(mockMediaDoc);

      await MediaService.deleteMedia(mockId);

      expect(MediaRepository.findOne).toHaveBeenCalledWith({ _id: mockId });
      expect(mockMediaDoc.softDelete).toHaveBeenCalled();
    });

    it('should throw error if media not found', async () => {
      (MediaRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(MediaService.deleteMedia(mockId)).rejects.toThrow(
        new AppError(httpStatus.NOT_FOUND, 'Media not found'),
      );
    });
  });
});
