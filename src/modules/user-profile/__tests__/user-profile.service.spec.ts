import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../../builder/app-error';
import * as UserProfileRepository from '../user-profile.repository';
import { UserProfileService } from '../user-profile.service';
import { TUserProfile } from '../user-profile.type';

// Mock repositories
jest.mock('../user-profile.repository');
jest.mock('../../user/user.repository', () => ({
  findById: jest.fn(),
}));
jest.mock('../../badge/badge.repository', () => ({
  findById: jest.fn(),
}));
jest.mock('../../category/category.repository', () => ({
  findById: jest.fn(),
}));

import * as UserRepository from '../../user/user.repository';

describe('UserProfile Service', () => {
  const mockUserId = new mongoose.Types.ObjectId().toString();

  const mockProfile: Partial<TUserProfile> = {
    user: new mongoose.Types.ObjectId(mockUserId),
    bio: 'Test bio',
    reputation_score: 0,
    badges: [],
    total_comments: 0,
    total_reactions: 0,
    articles_read: 0,
    reading_streak: 0,
    notification_preferences: {
      email_notifications: true,
      push_notifications: true,
      comment_replies: true,
      article_updates: true,
      newsletter: true,
    },
    email_frequency: 'daily',
    following_authors: [],
    following_categories: [],
    following_topics: [],
    is_verified_reader: false,
    is_premium: false,
    is_deleted: false,
  };

  const mockProfileDoc = {
    ...mockProfile,
    _id: new mongoose.Types.ObjectId(),
    save: jest.fn().mockResolvedValue(undefined),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrGetProfile', () => {
    it('should return existing profile', async () => {
      (UserProfileRepository.findByUserId as jest.Mock).mockResolvedValue(
        mockProfileDoc,
      );

      const result = await UserProfileService.createOrGetProfile(mockUserId);

      expect(UserProfileRepository.findByUserId).toHaveBeenCalledWith(
        mockUserId,
      );
      expect(result).toEqual(mockProfileDoc);
    });

    it('should create and return a new profile if not found', async () => {
      (UserProfileRepository.findByUserId as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockProfileDoc);
      (UserProfileRepository.create as jest.Mock).mockResolvedValue(
        mockProfileDoc,
      );

      const result = await UserProfileService.createOrGetProfile(mockUserId);

      expect(UserProfileRepository.create).toHaveBeenCalled();
      expect(result).toEqual(mockProfileDoc);
    });
  });

  describe('getProfileByUserId', () => {
    it('should return a profile by user id', async () => {
      (UserProfileRepository.findByUserId as jest.Mock).mockResolvedValue(
        mockProfileDoc,
      );

      const result = await UserProfileService.getProfileByUserId(mockUserId);

      expect(UserProfileRepository.findByUserId).toHaveBeenCalledWith(
        mockUserId,
      );
      expect(result).toEqual(mockProfileDoc);
    });

    it('should throw error if profile not found', async () => {
      (UserProfileRepository.findByUserId as jest.Mock).mockResolvedValue(null);

      await expect(
        UserProfileService.getProfileByUserId(mockUserId),
      ).rejects.toThrow(
        new AppError(httpStatus.NOT_FOUND, 'Profile not found'),
      );
    });
  });

  describe('updateProfile', () => {
    it('should update a user profile', async () => {
      (UserProfileRepository.findOne as jest.Mock).mockResolvedValue(
        mockProfileDoc,
      );
      (UserProfileRepository.findByUserId as jest.Mock).mockResolvedValue({
        ...mockProfileDoc,
        bio: 'Updated bio',
      });

      const result = await UserProfileService.updateProfile(mockUserId, {
        bio: 'Updated bio',
      });

      expect(UserProfileRepository.findOne).toHaveBeenCalledWith({
        user: mockUserId,
      });
      expect(mockProfileDoc.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw error if profile not found', async () => {
      (UserProfileRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        UserProfileService.updateProfile(mockUserId, { bio: 'Updated' }),
      ).rejects.toThrow(
        new AppError(httpStatus.NOT_FOUND, 'Profile not found'),
      );
    });
  });

  describe('followAuthor', () => {
    it('should follow an author', async () => {
      const authorId = new mongoose.Types.ObjectId().toString();
      (UserRepository.findById as jest.Mock).mockResolvedValue({
        _id: authorId,
      });
      (UserProfileRepository.findOne as jest.Mock).mockResolvedValue({
        ...mockProfileDoc,
        following_authors: [],
      });

      const result = await UserProfileService.followAuthor(
        mockUserId,
        authorId,
      );

      expect(UserRepository.findById).toHaveBeenCalledWith(authorId);
      expect(result).toBeDefined();
    });

    it('should throw error if author not found', async () => {
      const authorId = new mongoose.Types.ObjectId().toString();
      (UserRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        UserProfileService.followAuthor(mockUserId, authorId),
      ).rejects.toThrow(new AppError(httpStatus.NOT_FOUND, 'Author not found'));
    });
  });

  describe('getTopUsersByReputation', () => {
    it('should return top users by reputation', async () => {
      (UserProfileRepository.findMany as jest.Mock).mockResolvedValue([
        mockProfileDoc,
      ]);

      const result = await UserProfileService.getTopUsersByReputation(10);

      expect(UserProfileRepository.findMany).toHaveBeenCalledWith(
        {},
        expect.any(Array),
        expect.any(Object),
        10,
      );
      expect(result).toEqual([mockProfileDoc]);
    });
  });
});
