/**
 * comment.route.test.ts
 *
 * Integration tests for the Comment HTTP routes.
 * Service layer and middlewares are mocked.
 */

import express from 'express';
import httpStatus from 'http-status';
import supertest from 'supertest';

// ── Mock service ─────────────────────────────────────────────────────────────
jest.mock('../comment.service');

// ── Stub middlewares ──────────────────────────────────────────────────────────
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

jest.mock('../../../middlewares/guest.middleware', () => {
  return jest.fn((_mode: string) => {
    return (req: any, _res: any, next: any) => {
      req.guest = { token: 'mock-token' };
      next();
    };
  });
});

jest.mock('../../../middlewares/validation.middleware', () => {
  return jest.fn(() => (_req: any, _res: any, next: any) => next());
});

import commentRoutes from '../comment.route';
import * as CommentService from '../comment.service';

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/comment', commentRoutes);

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

const mockCommentData = {
  _id: '507f1f77bcf86cd799439011',
  news: '507f1f77bcf86cd799439012',
  user: '507f1f77bcf86cd799439011',
  content: 'Insightful comment',
  status: 'approved',
};

// ─── POST /api/comment ────────────────────────────────────────────────────────

describe('POST /api/comment', () => {
  it('should return 200 and create a comment', async () => {
    (CommentService.createComment as jest.Mock).mockResolvedValue(
      mockCommentData,
    );

    const res = await request.post('/api/comment').send({
      news: '507f1f77bcf86cd799439012',
      content: 'Insightful comment',
    });

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(mockCommentData);
  });
});

// ─── GET /api/comment/public ──────────────────────────────────────────────────

describe('GET /api/comment/public', () => {
  it('should return 200 and approved comments', async () => {
    const paginated = {
      data: [mockCommentData],
      meta: { total: 1, page: 1, limit: 10 },
    };
    (CommentService.getPublicComments as jest.Mock).mockResolvedValue(
      paginated,
    );

    const res = await request.get('/api/comment/public');

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.data).toEqual(paginated.data);
  });
});

// ─── PATCH /api/comment/:id/self ──────────────────────────────────────────────

describe('PATCH /api/comment/:id/self', () => {
  it('should update self comment and return 200', async () => {
    const updated = { ...mockCommentData, content: 'Updated content' };
    (CommentService.updateComment as jest.Mock).mockResolvedValue(updated);

    const res = await request
      .patch('/api/comment/507f1f77bcf86cd799439011/self')
      .send({ content: 'Updated content' });

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.data.content).toBe('Updated content');
  });
});

// ─── DELETE /api/comment/:id/self ─────────────────────────────────────────────

describe('DELETE /api/comment/:id/self', () => {
  it('should soft delete self comment and return 200', async () => {
    (CommentService.deleteSelfComment as jest.Mock).mockResolvedValue(
      undefined,
    );

    const res = await request.delete(
      '/api/comment/507f1f77bcf86cd799439011/self',
    );

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.success).toBe(true);
  });
});
