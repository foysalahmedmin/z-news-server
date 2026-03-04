/**
 * badge.route.test.ts
 *
 * Integration tests for the Badge HTTP routes.
 */

import express from 'express';
import httpStatus from 'http-status';
import supertest from 'supertest';

// ── Mock service ─────────────────────────────────────────────────────────────
jest.mock('../badge.service', () => ({
  BadgeService: {
    createBadge: jest.fn(),
    getAllBadges: jest.fn(),
    getActiveBadges: jest.fn(),
    getBadgesByCategory: jest.fn(),
    getBadgeById: jest.fn(),
    updateBadge: jest.fn(),
    deleteBadge: jest.fn(),
    checkAndAwardBadges: jest.fn(),
    seedDefaultBadges: jest.fn(),
  },
}));

// ── Stub middlewares ──────────────────────────────────────────────────────────
jest.mock('../../../middlewares/auth.middleware', () => {
  return jest.fn(() => (req: any, _res: any, next: any) => {
    req.user = { _id: '507f1f77bcf86cd799439011', role: 'admin' };
    next();
  });
});

jest.mock('../../../middlewares/validation.middleware', () => {
  return jest.fn(() => (_req: any, _res: any, next: any) => next());
});

import badgeRoutes from '../badge.route';
import { BadgeService } from '../badge.service';

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/badge', badgeRoutes);
  return app;
};

const app = buildApp();
const request = supertest(app);

const mockBadgeData = {
  _id: '507f1f77bcf86cd799439011',
  name: 'First Article',
  category: 'reader',
};

// ─── POST /api/badge/ ─────────────────────────────────────────────────────────

describe('POST /api/badge/', () => {
  it('should return 201 and create badge', async () => {
    (BadgeService.createBadge as jest.Mock).mockResolvedValue(mockBadgeData);

    const res = await request.post('/api/badge/').send({
      name: 'First Article',
      description: 'desc',
      icon: 'icon',
      category: 'reader',
      criteria: { type: 'articles_read', threshold: 1, description: 'desc' },
      rarity: 'common',
      points: 5,
    });

    expect(res.status).toBe(httpStatus.CREATED);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(mockBadgeData);
  });
});

// ─── GET /api/badge/ ──────────────────────────────────────────────────────────

describe('GET /api/badge/', () => {
  it('should return list of badges', async () => {
    (BadgeService.getAllBadges as jest.Mock).mockResolvedValue([mockBadgeData]);

    const res = await request.get('/api/badge/');

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.data).toEqual([mockBadgeData]);
  });
});

// ─── POST /api/badge/award/:userId ───────────────────────────────────────────

describe('POST /api/badge/award/:userId', () => {
  it('should award badges and return 200', async () => {
    (BadgeService.checkAndAwardBadges as jest.Mock).mockResolvedValue([
      mockBadgeData,
    ]);

    const res = await request.post('/api/badge/award/507f1f77bcf86cd799439013');

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.data).toEqual([mockBadgeData]);
  });
});
