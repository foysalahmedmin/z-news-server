import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../../builder/app-error';
import * as PollRepository from '../poll.repository';
import { PollService } from '../poll.service';
import { TPoll } from '../poll.type';

// Mock repositories
jest.mock('../poll.repository');
jest.mock('../../news/news.repository', () => ({
  findById: jest.fn(),
}));
jest.mock('../../user-profile/user-profile.repository', () => ({
  incrementActivityStat: jest.fn(),
}));

import * as NewsRepository from '../../news/news.repository';

describe('Poll Service', () => {
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockPollId = new mongoose.Types.ObjectId().toString();
  const mockNewsId = new mongoose.Types.ObjectId();

  const mockPoll: Partial<TPoll> = {
    title: 'Test Poll',
    options: [
      { text: 'Option A', votes: 0, voters: [] },
      { text: 'Option B', votes: 0, voters: [] },
    ],
    allow_multiple_votes: false,
    max_votes: 1,
    allow_anonymous: true,
    show_results_before_vote: false,
    randomize_options: false,
    start_date: new Date(),
    is_active: true,
    total_votes: 0,
    unique_voters: 0,
    votes: [],
    tags: [],
    is_featured: false,
    is_deleted: false,
  };

  const mockPollDoc = {
    ...mockPoll,
    _id: new mongoose.Types.ObjectId(mockPollId),
    created_by: new mongoose.Types.ObjectId(mockUserId),
    toObject: jest.fn().mockReturnThis(),
    softDelete: jest.fn().mockResolvedValue(undefined),
    save: jest.fn().mockResolvedValue(undefined),
    status: 'active',
    results: [],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPoll', () => {
    it('should create a poll without news', async () => {
      (PollRepository.create as jest.Mock).mockResolvedValue(mockPollDoc);
      (PollRepository.findOne as jest.Mock).mockResolvedValue(mockPollDoc);

      const result = await PollService.createPoll(mockUserId, mockPoll);

      expect(PollRepository.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw error if associated news not found', async () => {
      (NewsRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        PollService.createPoll(mockUserId, {
          ...mockPoll,
          news: mockNewsId,
        }),
      ).rejects.toThrow(
        new AppError(httpStatus.NOT_FOUND, 'News article not found'),
      );
    });
  });

  describe('getPollById', () => {
    it('should return a poll by id', async () => {
      (PollRepository.findOne as jest.Mock).mockResolvedValue(mockPollDoc);
      (PollRepository.hasUserVoted as jest.Mock).mockResolvedValue(false);

      const result = await PollService.getPollById(mockPollId, mockUserId);

      expect(PollRepository.findOne).toHaveBeenCalledWith(
        { _id: mockPollId },
        expect.any(Array),
      );
      expect(result).toHaveProperty('has_voted');
    });

    it('should throw error if poll not found', async () => {
      (PollRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(PollService.getPollById(mockPollId)).rejects.toThrow(
        new AppError(httpStatus.NOT_FOUND, 'Poll not found'),
      );
    });
  });

  describe('updatePoll', () => {
    it('should update a poll', async () => {
      const pollDocWithCreator = {
        ...mockPollDoc,
        created_by: { toString: () => mockUserId },
      };
      (PollRepository.findById as jest.Mock).mockResolvedValue(
        pollDocWithCreator,
      );
      (PollRepository.save as jest.Mock).mockResolvedValue(pollDocWithCreator);
      (PollRepository.findOne as jest.Mock).mockResolvedValue(pollDocWithCreator);

      const result = await PollService.updatePoll(mockPollId, mockUserId, {
        title: 'Updated Poll',
      });

      expect(PollRepository.findById).toHaveBeenCalledWith(mockPollId);
      expect(result).toBeDefined();
    });

    it('should throw error if poll not found', async () => {
      (PollRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        PollService.updatePoll(mockPollId, mockUserId, { title: 'Updated' }),
      ).rejects.toThrow(new AppError(httpStatus.NOT_FOUND, 'Poll not found'));
    });

    it('should throw error if user is not creator', async () => {
      const otherUserId = new mongoose.Types.ObjectId().toString();
      const pollDocWithOtherCreator = {
        ...mockPollDoc,
        created_by: { toString: () => otherUserId },
      };
      (PollRepository.findById as jest.Mock).mockResolvedValue(
        pollDocWithOtherCreator,
      );

      await expect(
        PollService.updatePoll(mockPollId, mockUserId, { title: 'Updated' }),
      ).rejects.toThrow(
        new AppError(
          httpStatus.FORBIDDEN,
          'You are not authorized to update this poll',
        ),
      );
    });
  });

  describe('deletePoll', () => {
    it('should delete a poll', async () => {
      const pollDocWithCreator = {
        ...mockPollDoc,
        created_by: { toString: () => mockUserId },
      };
      (PollRepository.findById as jest.Mock).mockResolvedValue(
        pollDocWithCreator,
      );

      const result = await PollService.deletePoll(mockPollId, mockUserId);

      expect(pollDocWithCreator.softDelete).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw error if poll not found', async () => {
      (PollRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        PollService.deletePoll(mockPollId, mockUserId),
      ).rejects.toThrow(new AppError(httpStatus.NOT_FOUND, 'Poll not found'));
    });

    it('should throw error if user is not creator', async () => {
      const otherUserId = new mongoose.Types.ObjectId().toString();
      (PollRepository.findById as jest.Mock).mockResolvedValue({
        ...mockPollDoc,
        created_by: { toString: () => otherUserId },
      });

      await expect(
        PollService.deletePoll(mockPollId, mockUserId),
      ).rejects.toThrow(
        new AppError(
          httpStatus.FORBIDDEN,
          'You are not authorized to delete this poll',
        ),
      );
    });
  });
});
