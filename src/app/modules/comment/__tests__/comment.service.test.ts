/**
 * comment.service.test.ts
 *
 * Unit tests for the Comment Service layer.
 * Repository and other dependencies are fully mocked.
 */

import httpStatus from 'http-status';
import { Types } from 'mongoose';

// ── Mock dependencies ─────────────────────────────────────────────────────────
jest.mock('../comment.repository');
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

import { TJwtPayload } from '../../../types/jsonwebtoken.type';
import { TGuest } from '../../guest/guest.type';
import * as CommentRepository from '../comment.repository';
import * as CommentService from '../comment.service';
import { TComment } from '../comment.type';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockComment = (overrides: Partial<TComment> = {}): TComment =>
  ({
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    news: new Types.ObjectId('507f1f77bcf86cd799439012'),
    user: new Types.ObjectId('507f1f77bcf86cd799439013'),
    name: 'John Doe',
    email: 'john@example.com',
    content: 'Mock comment content',
    status: 'approved',
    is_deleted: false,
    ...overrides,
  }) as TComment;

const mockJwtPayload = (): TJwtPayload => ({
  _id: '507f1f77bcf86cd799439013',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user',
});

const mockGuest = (): TGuest =>
  ({
    _id: new Types.ObjectId('507f1f77bcf86cd799439014') as any,
    token: 'mock-guest-token',
    session_id: 'session-id',
    preferences: {},
    status: 'in-progress',
  }) as TGuest;

// ─── createComment ────────────────────────────────────────────────────────────

describe('CommentService.createComment', () => {
  it('should create a comment for a user', async () => {
    const comment = mockComment();
    const doc = { ...comment, toObject: () => comment };
    (CommentRepository.create as jest.Mock).mockResolvedValue(doc);

    const result = await CommentService.createComment(
      mockJwtPayload(),
      {} as TGuest,
      comment,
    );

    expect(CommentRepository.create).toHaveBeenCalled();
    expect(result).toEqual(comment);
  });

  it('should create a comment for a guest', async () => {
    const comment = mockComment({ user: undefined, guest: 'mock-guest-token' });
    const doc = { ...comment, toObject: () => comment };
    (CommentRepository.create as jest.Mock).mockResolvedValue(doc);

    const result = await CommentService.createComment(
      {} as TJwtPayload,
      mockGuest(),
      comment,
    );

    expect(CommentRepository.create).toHaveBeenCalled();
    expect(result).toEqual(comment);
  });

  it('should throw NOT_FOUND if no user or guest provided', async () => {
    await expect(
      CommentService.createComment(
        {} as TJwtPayload,
        {} as TGuest,
        mockComment(),
      ),
    ).rejects.toMatchObject({ status: httpStatus.NOT_FOUND });
  });
});

// ─── getSelfComment ───────────────────────────────────────────────────────────

describe('CommentService.getSelfComment', () => {
  it('should return self comment if found', async () => {
    const comment = mockComment();
    (CommentRepository.findOneLean as jest.Mock).mockResolvedValue(comment);

    const result = await CommentService.getSelfComment(
      mockJwtPayload(),
      {} as TGuest,
      'id',
    );

    expect(result).toEqual(comment);
  });

  it('should throw NOT_FOUND if comment not found', async () => {
    (CommentRepository.findOneLean as jest.Mock).mockResolvedValue(null);

    await expect(
      CommentService.getSelfComment(mockJwtPayload(), {} as TGuest, 'id'),
    ).rejects.toMatchObject({ status: httpStatus.NOT_FOUND });
  });
});

// ─── updateComment ────────────────────────────────────────────────────────────

describe('CommentService.updateComment', () => {
  it('should update comment and return result', async () => {
    const comment = mockComment();
    const updated = { ...comment, content: 'Updated content' };
    (CommentRepository.findByIdLean as jest.Mock).mockResolvedValue(comment);
    (CommentRepository.findByIdAndUpdateLean as jest.Mock).mockResolvedValue(
      updated,
    );

    const result = await CommentService.updateComment('id', {
      content: 'Updated content',
    });

    expect(result.content).toBe('Updated content');
    expect(CommentRepository.findByIdAndUpdateLean).toHaveBeenCalledWith(
      'id',
      expect.objectContaining({
        content: 'Updated content',
        is_edited: true,
      }),
    );
  });
});

// ─── deleteCommentPermanent ───────────────────────────────────────────────────

describe('CommentService.deleteCommentPermanent', () => {
  it('should delete permanently if found with bypassDeleted', async () => {
    (CommentRepository.findByIdLean as jest.Mock).mockResolvedValue(
      mockComment({ is_deleted: true }),
    );
    (CommentRepository.deleteById as jest.Mock).mockResolvedValue(
      mockComment(),
    );

    await CommentService.deleteCommentPermanent('id');

    expect(CommentRepository.findByIdLean).toHaveBeenCalledWith('id', [], {
      bypassDeleted: true,
    });
    expect(CommentRepository.deleteById).toHaveBeenCalledWith('id');
  });
});
