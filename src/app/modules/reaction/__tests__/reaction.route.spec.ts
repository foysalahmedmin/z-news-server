/**
 * reaction.route.test.ts
 *
 * Integration tests for the Reaction HTTP routes.
 * The service layer is fully mocked. Middlewares are stubbed.
 */

import express from 'express';
import httpStatus from 'http-status';
import supertest from 'supertest';

// ── Mock service BEFORE importing routes ─────────────────────────────────────
jest.mock('../reaction.service');

// ── Stub auth middleware ───────────────────────────────────────────────────────
jest.mock('../../../middlewares/auth.middleware', () => {
  return jest.fn((..._roles: string[]) => {
    return (req: any, _res: any, next: any) => {
      req.user = {
        _id: '507f1f77bcf86cd799439011',
        role: 'user',
        name: 'John Doe',
        email: 'john@example.com',
      };
      next();
    };
  });
});

// ── Stub guest middleware ─────────────────────────────────────────────────────
jest.mock('../../../middlewares/guest.middleware', () => {
  return jest.fn((_mode: string) => {
    return (req: any, _res: any, next: any) => {
      req.guest = { token: 'mock-guest-token' };
      next();
    };
  });
});

// ── Stub validation middleware ────────────────────────────────────────────────
jest.mock('../../../middlewares/validation.middleware', () => {
  return jest.fn(() => (_req: any, _res: any, next: any) => next());
});

import ReactionRoutes from '../reaction.route';
import * as ReactionService from '../reaction.service';

// ─── App Factory ──────────────────────────────────────────────────────────────

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/reaction', ReactionRoutes);
  app.use((err: any, _req: any, res: any, _next: any) => {
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });
  });
  return app;
};

const app = buildApp();
const request = supertest(app);

// ─── Shared Data ──────────────────────────────────────────────────────────────

const mockReaction = {
  _id: '507f1f77bcf86cd799439011',
  news: '507f1f77bcf86cd799439012',
  user: '507f1f77bcf86cd799439011',
  type: 'like',
  status: 'approved',
};

// ─── POST /api/reaction ───────────────────────────────────────────────────────

describe('POST /api/reaction', () => {
  it('should return 200 and create a reaction', async () => {
    (ReactionService.createReaction as jest.Mock).mockResolvedValue(
      mockReaction,
    );

    const res = await request
      .post('/api/reaction')
      .send({ news: '507f1f77bcf86cd799439012', type: 'like' });

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.success).toBe(true);
    expect(ReactionService.createReaction).toHaveBeenCalled();
  });
});

// ─── GET /api/reaction/ (admin list) ─────────────────────────────────────────

describe('GET /api/reaction', () => {
  it('should return 200 with paginated reactions for admin', async () => {
    const paginated = {
      data: [mockReaction],
      meta: { total: 1, page: 1, limit: 10 },
    };
    (ReactionService.getReactions as jest.Mock).mockResolvedValue(paginated);

    const res = await request.get('/api/reaction');

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.success).toBe(true);
  });
});

// ─── GET /api/reaction/self (self list) ──────────────────────────────────────

describe('GET /api/reaction/self', () => {
  it('should return 200 with paginated self reactions', async () => {
    const paginated = {
      data: [mockReaction],
      meta: { total: 1, page: 1, limit: 10 },
    };
    (ReactionService.getSelfReactions as jest.Mock).mockResolvedValue(
      paginated,
    );

    const res = await request.get('/api/reaction/self');

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.success).toBe(true);
  });
});

// ─── GET /api/reaction/news/:news_id/self ─────────────────────────────────────

describe('GET /api/reaction/news/:news_id/self', () => {
  it('should return self news reaction with counts', async () => {
    const response = {
      data: mockReaction,
      meta: { likes: 10, dislikes: 5 },
      guest: { token: 't' },
    };
    (ReactionService.getSelfNewsReaction as jest.Mock).mockResolvedValue(
      response,
    );

    const res = await request.get(
      '/api/reaction/news/507f1f77bcf86cd799439012/self',
    );

    expect(res.status).toBe(httpStatus.OK);
    // Controller sends `meta` as a top-level sendResponse property (not nested under data)
    expect(res.body.meta.likes).toBe(10);
    expect(ReactionService.getSelfNewsReaction).toHaveBeenCalled();
  });
});

// ─── GET /api/reaction/:id/self ───────────────────────────────────────────────

describe('GET /api/reaction/:id/self', () => {
  it('should return self reaction by id', async () => {
    (ReactionService.getSelfReaction as jest.Mock).mockResolvedValue(
      mockReaction,
    );

    const res = await request.get(
      '/api/reaction/507f1f77bcf86cd799439011/self',
    );

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.data).toEqual(mockReaction);
  });
});

// ─── PATCH /api/reaction/:id/self ────────────────────────────────────────────

describe('PATCH /api/reaction/:id/self', () => {
  it('should update self reaction type', async () => {
    (ReactionService.updateSelfReaction as jest.Mock).mockResolvedValue({
      ...mockReaction,
      type: 'dislike',
    });

    const res = await request
      .patch('/api/reaction/507f1f77bcf86cd799439011/self')
      .send({ type: 'dislike' });

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.success).toBe(true);
  });
});

// ─── DELETE /api/reaction/:id/self ───────────────────────────────────────────

describe('DELETE /api/reaction/:id/self', () => {
  it('should delete self reaction', async () => {
    (ReactionService.deleteSelfReaction as jest.Mock).mockResolvedValue(
      undefined,
    );

    const res = await request.delete(
      '/api/reaction/507f1f77bcf86cd799439011/self',
    );

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.success).toBe(true);
  });
});

// ─── DELETE /api/reaction/:id (admin) ────────────────────────────────────────

describe('DELETE /api/reaction/:id (admin)', () => {
  it('should delete reaction by id', async () => {
    (ReactionService.deleteReaction as jest.Mock).mockResolvedValue(undefined);

    const res = await request.delete('/api/reaction/507f1f77bcf86cd799439011');

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.success).toBe(true);
  });
});
