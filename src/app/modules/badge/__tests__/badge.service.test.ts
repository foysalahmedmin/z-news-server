/**
 * badge.service.test.ts
 *
 * Unit tests for the Badge Service layer.
 */

import { Types } from 'mongoose';

// ── Mock dependencies ─────────────────────────────────────────────────────────
jest.mock('../badge.repository');
jest.mock('../../user-profile/user-profile.model', () => ({
  UserProfile: {
    findOne: jest.fn(),
  },
}));

import { UserProfile } from '../../user-profile/user-profile.model';
import * as BadgeRepository from '../badge.repository';
import { BadgeService } from '../badge.service';
import { TBadge, TBadgeDocument } from '../badge.type';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockBadgeDoc = (overrides: Partial<TBadge> = {}): TBadgeDocument =>
  ({
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    name: 'First Article',
    description: 'Read your first article',
    icon: '📖',
    category: 'reader',
    criteria: {
      type: 'articles_read',
      threshold: 1,
      description: 'Read 1 article',
    },
    rarity: 'common',
    points: 5,
    is_active: true,
    is_deleted: false,
    softDelete: jest.fn().mockResolvedValue(true),
    ...overrides,
  }) as unknown as TBadgeDocument;

const mockProfile = (overrides = {}) => ({
  _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
  user: new Types.ObjectId('507f1f77bcf86cd799439013'),
  articles_read: 0,
  total_comments: 0,
  reading_streak: 0,
  reputation_score: 0,
  badges: [],
  created_at: new Date(Date.now() - 1000 * 60),
  save: jest.fn().mockResolvedValue(true),
  ...overrides,
});

// ─── createBadge ─────────────────────────────────────────────────────────────

describe('BadgeService.createBadge', () => {
  it('should create a badge successfully', async () => {
    const payload = { name: 'Test Badge' } as TBadge;
    const mockCreated = mockBadgeDoc(payload);
    (BadgeRepository.create as jest.Mock).mockResolvedValue(mockCreated);

    const result = await BadgeService.createBadge(payload);

    expect(BadgeRepository.create).toHaveBeenCalledWith(payload);
    expect(result).toEqual(mockCreated);
  });
});

// ─── getAllBadges ────────────────────────────────────────────────────────────

describe('BadgeService.getAllBadges', () => {
  it('should return all badges with filters', async () => {
    const badges = [mockBadgeDoc()];
    (BadgeRepository.findMany as jest.Mock).mockResolvedValue(badges);

    const result = await BadgeService.getAllBadges({
      category: 'reader',
      is_active: 'true',
    });

    expect(BadgeRepository.findMany).toHaveBeenCalledWith({
      category: 'reader',
      is_active: true,
    });
    expect(result).toEqual(badges);
  });
});

// ─── checkAndAwardBadges ─────────────────────────────────────────────────────

describe('BadgeService.checkAndAwardBadges', () => {
  it('should award badge when criteria met', async () => {
    const profile = mockProfile({ articles_read: 1 });
    const badge = mockBadgeDoc({
      criteria: { type: 'articles_read', threshold: 1, description: 'Read 1' },
      points: 10,
    });

    (UserProfile.findOne as jest.Mock).mockResolvedValue(profile);
    (BadgeRepository.getActiveBadges as jest.Mock).mockResolvedValue([badge]);

    const result = await BadgeService.checkAndAwardBadges('user-id');

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('First Article');
    expect(profile.badges).toHaveLength(1);
    expect(profile.reputation_score).toBe(10);
    expect(profile.save).toHaveBeenCalled();
  });

  it('should not award badge when already earned', async () => {
    const badgeId = new Types.ObjectId();
    const profile = mockProfile({
      articles_read: 10,
      badges: [{ badge_id: badgeId, earned_at: new Date() }],
    });
    const badge = mockBadgeDoc({
      _id: badgeId,
      criteria: { type: 'articles_read', threshold: 1, description: 'Read 1' },
    });

    (UserProfile.findOne as jest.Mock).mockResolvedValue(profile);
    (BadgeRepository.getActiveBadges as jest.Mock).mockResolvedValue([badge]);

    const result = await BadgeService.checkAndAwardBadges('user-id');

    expect(result).toHaveLength(0);
    expect(profile.save).not.toHaveBeenCalled();
  });
});

// ─── seedDefaultBadges ───────────────────────────────────────────────────────

describe('BadgeService.seedDefaultBadges', () => {
  it('should seed default badges if they dont exist', async () => {
    (BadgeRepository.findOne as jest.Mock).mockResolvedValue(null);
    (BadgeRepository.create as jest.Mock).mockResolvedValue(mockBadgeDoc());
    (BadgeRepository.findMany as jest.Mock).mockResolvedValue([mockBadgeDoc()]);

    const result = await BadgeService.seedDefaultBadges();

    expect(BadgeRepository.create).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});
