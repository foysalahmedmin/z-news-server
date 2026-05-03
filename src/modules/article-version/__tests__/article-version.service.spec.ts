import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../../builder/app-error';
import { ArticleVersionService } from '../article-version.service';
import { TArticleVersion } from '../article-version.type';

// Mock models used directly in the service
jest.mock('../../news/news.model', () => ({
  News: {
    findById: jest.fn(),
  },
}));

jest.mock('../article-version.model', () => ({
  ArticleVersion: {
    findOne: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      }),
    }),
    create: jest.fn(),
    findById: jest.fn(),
    getVersionsByNewsId: jest.fn(),
  },
}));

import { News } from '../../news/news.model';
import { ArticleVersion } from '../article-version.model';

describe('ArticleVersion Service', () => {
  const mockId = new mongoose.Types.ObjectId().toString();
  const mockNewsId = new mongoose.Types.ObjectId().toString();
  const mockUserId = new mongoose.Types.ObjectId().toString();

  const mockNews = {
    _id: new mongoose.Types.ObjectId(mockNewsId),
    title: 'Test Article',
    sub_title: 'Sub',
    description: 'Desc',
    tags: ['tag1'],
    category: new mongoose.Types.ObjectId(),
    categories: [],
    thumbnail: null,
    video: null,
    youtube: '',
    content: '<p>Content</p>',
    save: jest.fn(),
  };

  const mockVersion: Partial<TArticleVersion> & {
    version_number: number;
    created_at: Date;
    changed_by: mongoose.Types.ObjectId;
    content_snapshot: string;
    metadata_snapshot: Record<string, unknown>;
    softDelete: jest.Mock;
    populate: jest.Mock;
  } = {
    news: new mongoose.Types.ObjectId(mockNewsId),
    version_number: 1,
    content_snapshot: '<p>Content</p>',
    metadata_snapshot: { title: 'Test Article' },
    changed_by: new mongoose.Types.ObjectId(mockUserId),
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    softDelete: jest.fn(),
    populate: jest.fn().mockReturnThis(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createVersion', () => {
    it('should create a new version snapshot', async () => {
      (News.findById as jest.Mock).mockResolvedValue(mockNews);
      (ArticleVersion.findOne as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({ version_number: 1 }),
        }),
      });
      (ArticleVersion.create as jest.Mock).mockResolvedValue(mockVersion);

      const result = await ArticleVersionService.createVersion(
        mockNewsId,
        mockUserId,
        'Test change',
      );

      expect(News.findById).toHaveBeenCalledWith(mockNewsId);
      expect(ArticleVersion.findOne).toHaveBeenCalled();
      expect(ArticleVersion.create).toHaveBeenCalled();
      expect(result).toEqual(mockVersion);
    });

    it('should throw error if news not found', async () => {
      (News.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        ArticleVersionService.createVersion(mockNewsId, mockUserId),
      ).rejects.toThrow(
        new AppError(httpStatus.NOT_FOUND, 'News article not found'),
      );
    });

    it('should start version from 1 when no previous versions exist', async () => {
      (News.findById as jest.Mock).mockResolvedValue(mockNews);
      (ArticleVersion.findOne as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(null),
        }),
      });
      (ArticleVersion.create as jest.Mock).mockResolvedValue({
        ...mockVersion,
        version_number: 1,
      });

      await ArticleVersionService.createVersion(mockNewsId, mockUserId);

      expect(ArticleVersion.create).toHaveBeenCalledWith(
        expect.objectContaining({ version_number: 1 }),
      );
    });
  });

  describe('getVersionsByNewsId', () => {
    it('should return all versions for a news article', async () => {
      (ArticleVersion.getVersionsByNewsId as jest.Mock).mockResolvedValue([
        mockVersion,
      ]);

      const result =
        await ArticleVersionService.getVersionsByNewsId(mockNewsId);

      expect(ArticleVersion.getVersionsByNewsId).toHaveBeenCalledWith(
        mockNewsId,
      );
      expect(result).toEqual([mockVersion]);
    });
  });

  describe('getVersionById', () => {
    it('should return a version by id', async () => {
      (ArticleVersion.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockVersion),
      });

      const result = await ArticleVersionService.getVersionById(mockId);

      expect(ArticleVersion.findById).toHaveBeenCalledWith(mockId);
      expect(result).toEqual(mockVersion);
    });

    it('should throw error if version not found', async () => {
      (ArticleVersion.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await expect(
        ArticleVersionService.getVersionById(mockId),
      ).rejects.toThrow(
        new AppError(httpStatus.NOT_FOUND, 'Version not found'),
      );
    });
  });

  describe('compareVersions', () => {
    it('should compare two versions', async () => {
      const mockVersion2 = { ...mockVersion, version_number: 2 };

      (ArticleVersion.findOne as jest.Mock)
        .mockResolvedValueOnce(mockVersion)
        .mockResolvedValueOnce(mockVersion2);

      const result = await ArticleVersionService.compareVersions(
        mockNewsId,
        1,
        2,
      );

      expect(result).toHaveProperty('version1');
      expect(result).toHaveProperty('version2');
    });

    it('should throw error if one or both versions not found', async () => {
      (ArticleVersion.findOne as jest.Mock)
        .mockResolvedValueOnce(mockVersion)
        .mockResolvedValueOnce(null);

      await expect(
        ArticleVersionService.compareVersions(mockNewsId, 1, 99),
      ).rejects.toThrow(
        new AppError(httpStatus.NOT_FOUND, 'One or both versions not found'),
      );
    });
  });

  describe('deleteVersion', () => {
    it('should soft delete a version', async () => {
      const docWithSoftDelete = {
        ...mockVersion,
        softDelete: jest.fn().mockResolvedValue(undefined),
      };
      (ArticleVersion.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(docWithSoftDelete),
      });
      // Direct findById (no populate chaining) for deleteVersion
      (ArticleVersion.findById as jest.Mock).mockResolvedValueOnce(
        docWithSoftDelete,
      );

      const result = await ArticleVersionService.deleteVersion(mockId);

      expect(result).toBeDefined();
    });

    it('should throw error if version not found on delete', async () => {
      (ArticleVersion.findById as jest.Mock).mockResolvedValue(null);

      await expect(ArticleVersionService.deleteVersion(mockId)).rejects.toThrow(
        new AppError(httpStatus.NOT_FOUND, 'Version not found'),
      );
    });
  });
});
