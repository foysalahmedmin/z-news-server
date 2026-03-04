/**
 * reaction.service.test.ts
 *
 * Unit tests for the Reaction Service layer.
 * The repository and all other dependencies are fully mocked so
 * these tests run without a real DB, Redis, or SMTP connection.
 */

import httpStatus from 'http-status';

// ── Mock dependencies BEFORE any imports ─────────────────────────────────────
jest.mock('../reaction.repository');

jest.mock('../../../utils/cache.utils', () => ({
  withCache: jest.fn((_key: string, _ttl: number, fn: () => unknown) => fn()),
  invalidateCacheByPattern: jest.fn().mockResolvedValue(undefined),
  generateCacheKey: jest.fn(
    (_prefix: string, parts: unknown[]) => `mock:${parts.join(':')}`,
  ),
}));

jest.mock('../../user-profile/user-profile.model', () => ({
  UserProfile: {
    incrementActivityStat: jest.fn().mockResolvedValue(undefined),
  },
}));

import { Types } from 'mongoose';
import { TJwtPayload } from '../../../types/jsonwebtoken.type';
import { TGuest } from '../../guest/guest.type';
import * as ReactionRepository from '../reaction.repository';
import * as ReactionService from '../reaction.service';
import { TReaction } from '../reaction.type';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockReaction = (overrides: Partial<TReaction> = {}): TReaction => ({
  _id: new Types.ObjectId('507f1f77bcf86cd799439011') as any,
  news: new Types.ObjectId('507f1f77bcf86cd799439012') as any,
  user: new Types.ObjectId('507f1f77bcf86cd799439013') as any,
  type: 'like',
  status: 'approved',
  is_deleted: false,
  ...overrides,
});

const mockJwtPayload = (): TJwtPayload => ({
  _id: '507f1f77bcf86cd799439013',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user',
});

const mockGuest = (): Partial<TGuest> => ({
  _id: new Types.ObjectId('507f1f77bcf86cd799439014') as any,
  token: 'mock-guest-token',
  session_id: 'session-id',
  preferences: {},
  status: 'in-progress',
});

// ─── createReaction ───────────────────────────────────────────────────────────

describe('ReactionService.createReaction', () => {
  it('should create a reaction for a user', async () => {
    const reaction = mockReaction();
    const doc = { ...reaction, toObject: () => reaction };
    (ReactionRepository.create as jest.Mock).mockResolvedValue(doc);

    const result = await ReactionService.createReaction(
      mockJwtPayload(),
      {} as TGuest,
      reaction,
    );

    expect(ReactionRepository.create).toHaveBeenCalled();
    expect(result).toEqual(reaction);
  });

  it('should create a reaction for a guest', async () => {
    const reactionForGuest = mockReaction({
      user: undefined,
      guest: 'mock-guest-token',
    });
    const doc = { ...reactionForGuest, toObject: () => reactionForGuest };
    (ReactionRepository.create as jest.Mock).mockResolvedValue(doc);

    const result = await ReactionService.createReaction(
      {} as TJwtPayload,
      mockGuest() as TGuest,
      reactionForGuest,
    );

    expect(ReactionRepository.create).toHaveBeenCalled();
    expect(result).toEqual(reactionForGuest);
  });

  it('should throw NOT_FOUND if no user or guest provided', async () => {
    await expect(
      ReactionService.createReaction(
        {} as TJwtPayload,
        {} as TGuest,
        mockReaction(),
      ),
    ).rejects.toMatchObject({ status: httpStatus.NOT_FOUND });
  });
});

// ─── getSelfNewsReaction ──────────────────────────────────────────────────────

describe('ReactionService.getSelfNewsReaction', () => {
  it('should return self reaction and counts for a news', async () => {
    const reaction = mockReaction();
    (ReactionRepository.findOneLean as jest.Mock).mockResolvedValue(reaction);
    (ReactionRepository.count as jest.Mock).mockResolvedValue(10);

    const result = await ReactionService.getSelfNewsReaction(
      mockJwtPayload(),
      {} as TGuest,
      'news-id',
    );

    expect(result.data).toEqual(reaction);
    expect(result.meta.likes).toBe(10);
    expect(result.meta.dislikes).toBe(10);
  });

  it('should throw NOT_FOUND if news_id is missing', async () => {
    await expect(
      ReactionService.getSelfNewsReaction(mockJwtPayload(), {} as TGuest, ''),
    ).rejects.toMatchObject({ status: httpStatus.NOT_FOUND });
  });
});

// ─── getSelfReaction ──────────────────────────────────────────────────────────

describe('ReactionService.getSelfReaction', () => {
  it('should return self reaction by id', async () => {
    const reaction = mockReaction();
    (ReactionRepository.findOneLean as jest.Mock).mockResolvedValue(reaction);

    const result = await ReactionService.getSelfReaction(
      mockJwtPayload(),
      {} as TGuest,
      'reaction-id',
    );

    expect(result).toEqual(reaction);
  });

  it('should throw NOT_FOUND if reaction does not exist', async () => {
    (ReactionRepository.findOneLean as jest.Mock).mockResolvedValue(null);

    await expect(
      ReactionService.getSelfReaction(
        mockJwtPayload(),
        {} as TGuest,
        'reaction-id',
      ),
    ).rejects.toMatchObject({ status: httpStatus.NOT_FOUND });
  });
});

// ─── getReaction ──────────────────────────────────────────────────────────────

describe('ReactionService.getReaction', () => {
  it('should return reaction by id', async () => {
    const reaction = mockReaction();
    (ReactionRepository.findByIdLean as jest.Mock).mockResolvedValue(reaction);

    const result = await ReactionService.getReaction('reaction-id');

    expect(result).toEqual(reaction);
  });

  it('should throw NOT_FOUND if reaction does not exist', async () => {
    (ReactionRepository.findByIdLean as jest.Mock).mockResolvedValue(null);

    await expect(
      ReactionService.getReaction('reaction-id'),
    ).rejects.toMatchObject({ status: httpStatus.NOT_FOUND });
  });
});

// ─── getSelfReactions ─────────────────────────────────────────────────────────

describe('ReactionService.getSelfReactions', () => {
  it('should return paginated self reactions', async () => {
    const paginated = {
      data: [mockReaction()],
      meta: { total: 1, page: 1, limit: 10 },
    };
    (ReactionRepository.findPaginated as jest.Mock).mockResolvedValue(
      paginated,
    );

    const result = await ReactionService.getSelfReactions(
      mockJwtPayload(),
      {} as TGuest,
      {},
    );

    expect(result).toEqual(paginated);
  });
});

// ─── updateSelfReaction ───────────────────────────────────────────────────────

describe('ReactionService.updateSelfReaction', () => {
  it('should update self reaction type', async () => {
    const reaction = mockReaction();
    (ReactionRepository.findOneLean as jest.Mock).mockResolvedValue(reaction);
    (ReactionRepository.updateByIdLean as jest.Mock).mockResolvedValue({
      ...reaction,
      type: 'dislike',
    });

    const result = await ReactionService.updateSelfReaction(
      mockJwtPayload(),
      {} as TGuest,
      'id',
      { type: 'dislike' },
    );

    expect(result.type).toBe('dislike');
  });

  it('should throw NOT_FOUND if reaction does not belong to user', async () => {
    (ReactionRepository.findOneLean as jest.Mock).mockResolvedValue(null);

    await expect(
      ReactionService.updateSelfReaction(mockJwtPayload(), {} as TGuest, 'id', {
        type: 'dislike',
      }),
    ).rejects.toMatchObject({ status: httpStatus.NOT_FOUND });
  });
});

// ─── deleteSelfReaction ───────────────────────────────────────────────────────

describe('ReactionService.deleteSelfReaction', () => {
  it('should delete self reaction', async () => {
    (ReactionRepository.findOneAndDelete as jest.Mock).mockResolvedValue(
      mockReaction(),
    );

    await ReactionService.deleteSelfReaction(
      mockJwtPayload(),
      {} as TGuest,
      'id',
    );

    expect(ReactionRepository.findOneAndDelete).toHaveBeenCalled();
  });

  it('should throw NOT_FOUND if no user or guest provided', async () => {
    await expect(
      ReactionService.deleteSelfReaction({} as TJwtPayload, {} as TGuest, 'id'),
    ).rejects.toMatchObject({ status: httpStatus.NOT_FOUND });
  });
});

// ─── deleteReaction ───────────────────────────────────────────────────────────

describe('ReactionService.deleteReaction', () => {
  it('should delete a reaction by id', async () => {
    (ReactionRepository.findByIdLean as jest.Mock).mockResolvedValue(
      mockReaction(),
    );
    (ReactionRepository.deleteById as jest.Mock).mockResolvedValue(undefined);

    await ReactionService.deleteReaction('reaction-id');

    expect(ReactionRepository.deleteById).toHaveBeenCalledWith('reaction-id');
  });

  it('should throw NOT_FOUND if reaction does not exist', async () => {
    (ReactionRepository.findByIdLean as jest.Mock).mockResolvedValue(null);

    await expect(
      ReactionService.deleteReaction('reaction-id'),
    ).rejects.toMatchObject({ status: httpStatus.NOT_FOUND });
  });
});
