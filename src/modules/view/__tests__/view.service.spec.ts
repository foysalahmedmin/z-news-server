/**
 * view.service.test.ts
 *
 * Unit tests for the View Service layer.
 * The repository and cache utilities are fully mocked.
 */

import httpStatus from 'http-status';
import { Types } from 'mongoose';

// ── Mock dependencies ─────────────────────────────────────────────────────────
jest.mock('../view.repository');
jest.mock('../../../utils/cache.utils', () => ({
  withCache: jest.fn((_key: string, _ttl: number, fn: () => unknown) => fn()),
  invalidateCacheByPattern: jest.fn().mockResolvedValue(undefined),
  generateCacheKey: jest.fn(
    (_prefix: string, parts: unknown[]) => `mock:${parts.join(':')}`,
  ),
}));
jest.mock('../../user-profile/user-profile.repository', () => ({
  incrementActivityStat: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../user-profile/user-profile.service', () => ({
  UserProfileService: {
    updateReadingStreak: jest.fn().mockResolvedValue(undefined),
  },
}));
jest.mock('../../badge/badge.service', () => ({
  BadgeService: { checkAndAwardBadges: jest.fn().mockResolvedValue([]) },
}));

import { TJwtPayload } from '../../../types/jsonwebtoken.type';
import { TGuest } from '../../guest/guest.type';
import * as ViewRepository from '../view.repository';
import * as ViewService from '../view.service';
import { TView } from '../view.type';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockView = (overrides: Partial<TView> = {}): TView =>
  ({
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    news: new Types.ObjectId('507f1f77bcf86cd799439012'),
    user: new Types.ObjectId('507f1f77bcf86cd799439013'),
    is_deleted: false,
    ...overrides,
  }) as TView;

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

// ─── createView ───────────────────────────────────────────────────────────────

describe('ViewService.createView', () => {
  it('should create a view for a user', async () => {
    const view = mockView();
    const doc = { ...view, toObject: () => view };
    (ViewRepository.create as jest.Mock).mockResolvedValue(doc);

    const result = await ViewService.createView(
      mockJwtPayload(),
      {} as TGuest,
      view,
    );

    expect(ViewRepository.create).toHaveBeenCalled();
    expect(result).toEqual(view);
  });

  it('should create a view for a guest', async () => {
    const view = mockView({ user: undefined, guest: 'mock-guest-token' });
    const doc = { ...view, toObject: () => view };
    (ViewRepository.create as jest.Mock).mockResolvedValue(doc);

    const result = await ViewService.createView(
      {} as TJwtPayload,
      mockGuest(),
      view,
    );

    expect(ViewRepository.create).toHaveBeenCalled();
    expect(result).toEqual(view);
  });

  it('should throw NOT_FOUND if no user or guest provided', async () => {
    await expect(
      ViewService.createView({} as TJwtPayload, {} as TGuest, mockView()),
    ).rejects.toMatchObject({ status: httpStatus.NOT_FOUND });
  });
});

// ─── getSelfView ──────────────────────────────────────────────────────────────

describe('ViewService.getSelfView', () => {
  it('should return self view if found', async () => {
    const view = mockView();
    (ViewRepository.findOneLean as jest.Mock).mockResolvedValue(view);

    const result = await ViewService.getSelfView(
      mockJwtPayload(),
      {} as TGuest,
      'view-id',
    );

    expect(result).toEqual(view);
  });

  it('should throw NOT_FOUND if view not found', async () => {
    (ViewRepository.findOneLean as jest.Mock).mockResolvedValue(null);

    await expect(
      ViewService.getSelfView(mockJwtPayload(), {} as TGuest, 'view-id'),
    ).rejects.toMatchObject({ status: httpStatus.NOT_FOUND });
  });
});

// ─── getView ──────────────────────────────────────────────────────────────────

describe('ViewService.getView', () => {
  it('should return view by id', async () => {
    const view = mockView();
    (ViewRepository.findByIdLean as jest.Mock).mockResolvedValue(view);

    const result = await ViewService.getView('view-id');

    expect(result).toEqual(view);
  });

  it('should throw NOT_FOUND if view not found', async () => {
    (ViewRepository.findByIdLean as jest.Mock).mockResolvedValue(null);

    await expect(ViewService.getView('view-id')).rejects.toMatchObject({
      status: httpStatus.NOT_FOUND,
    });
  });
});

// ─── getSelfNewsView ──────────────────────────────────────────────────────────

describe('ViewService.getSelfNewsView', () => {
  it('should create new view and update stats if not viewed yet', async () => {
    (ViewRepository.findOneLean as jest.Mock).mockResolvedValue(null);
    (ViewRepository.create as jest.Mock).mockResolvedValue(mockView());
    (ViewRepository.count as jest.Mock).mockResolvedValue(100);

    const result = await ViewService.getSelfNewsView(
      mockJwtPayload(),
      {} as TGuest,
      'news-id',
    );

    expect(ViewRepository.create).toHaveBeenCalled();
    expect(result.meta.views).toBe(100);
  });

  it('should only return count if already viewed', async () => {
    (ViewRepository.findOneLean as jest.Mock).mockResolvedValue(mockView());
    (ViewRepository.count as jest.Mock).mockResolvedValue(100);

    const result = await ViewService.getSelfNewsView(
      mockJwtPayload(),
      {} as TGuest,
      'news-id',
    );

    expect(ViewRepository.create).not.toHaveBeenCalled();
    expect(result.meta.views).toBe(100);
  });
});

// ─── deleteSelfView ───────────────────────────────────────────────────────────

describe('ViewService.deleteSelfView', () => {
  it('should delete self view', async () => {
    (ViewRepository.findOneAndDelete as jest.Mock).mockResolvedValue(
      mockView(),
    );

    await ViewService.deleteSelfView(mockJwtPayload(), {} as TGuest, 'id');

    expect(ViewRepository.findOneAndDelete).toHaveBeenCalled();
  });
});
