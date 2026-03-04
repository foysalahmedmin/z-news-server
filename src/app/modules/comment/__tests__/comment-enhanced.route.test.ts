/**
 * comment-enhanced.route.test.ts
 *
 * Integration tests for Enhanced Comment routes.
 */

import express from 'express';
import httpStatus from 'http-status';
import supertest from 'supertest';

// ── Mock service ─────────────────────────────────────────────────────────────
jest.mock('../comment-enhanced.service', () => ({
  EnhancedCommentService: {
    getThreadedComments: jest.fn(),
    createReply: jest.fn(),
    addReaction: jest.fn(),
    pinComment: jest.fn(),
    flagComment: jest.fn(),
    moderateComment: jest.fn(),
  },
}));

// ── Stub middlewares ──────────────────────────────────────────────────────────
jest.mock('../../../middlewares/auth.middleware', () => {
  return jest.fn(() => (req: any, _res: any, next: any) => {
    req.user = { _id: '507f1f77bcf86cd799439013', role: 'admin' };
    next();
  });
});

jest.mock('../../../middlewares/validation.middleware', () => {
  return jest.fn(() => (_req: any, _res: any, next: any) => next());
});

import { EnhancedCommentRoutes } from '../comment-enhanced.route';
import { EnhancedCommentService } from '../comment-enhanced.service';

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/comment-enhanced', EnhancedCommentRoutes);
  return app;
};

const app = buildApp();
const request = supertest(app);

// ─── GET /api/comment-enhanced/news/:news_id/threaded ─────────────────────────

describe('GET /api/comment-enhanced/news/:news_id/threaded', () => {
  it('should return threaded comments', async () => {
    const mockData = [{ _id: '1', content: 'Top', replies: [] }];
    (EnhancedCommentService.getThreadedComments as jest.Mock).mockResolvedValue(
      mockData,
    );

    const res = await request.get(
      '/api/comment-enhanced/news/news-id/threaded',
    );

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.data).toEqual(mockData);
  });
});

// ─── POST /api/comment-enhanced/:comment_id/reply ─────────────────────────────

describe('POST /api/comment-enhanced/:comment_id/reply', () => {
  it('should create a reply', async () => {
    const mockReply = { _id: '2', content: 'Reply content' };
    (EnhancedCommentService.createReply as jest.Mock).mockResolvedValue(
      mockReply,
    );

    const res = await request.post('/api/comment-enhanced/1/reply').send({
      content: 'Reply content',
      name: 'John',
      email: 'john@example.com',
    });

    expect(res.status).toBe(httpStatus.CREATED);
    expect(res.body.data).toEqual(mockReply);
  });
});

// ─── POST /api/comment-enhanced/:comment_id/reaction ──────────────────────────

describe('POST /api/comment-enhanced/:comment_id/reaction', () => {
  it('should add a reaction', async () => {
    const mockComment = { _id: '1', content: 'Content', reactions: [] };
    (EnhancedCommentService.addReaction as jest.Mock).mockResolvedValue(
      mockComment,
    );

    const res = await request
      .post('/api/comment-enhanced/1/reaction')
      .send({ type: 'like' });

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.data).toEqual(mockComment);
  });
});

// ─── PATCH /api/comment-enhanced/:comment_id/pin ──────────────────────────────

describe('PATCH /api/comment-enhanced/:comment_id/pin', () => {
  it('should pin a comment', async () => {
    const mockComment = { _id: '1', is_pinned: true };
    (EnhancedCommentService.pinComment as jest.Mock).mockResolvedValue(
      mockComment,
    );

    const res = await request.patch('/api/comment-enhanced/1/pin');

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.data.is_pinned).toBe(true);
  });
});
