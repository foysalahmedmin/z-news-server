/**
 * Integration: News Content Flow
 *
 * Tests the news content lifecycle:
 *   create draft → get → update → publish → react → comment → bookmark → delete
 *
 * Services are mocked; validation middleware and error handler run real.
 */

import express from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import supertest from 'supertest';

jest.mock('../modules/news/news.service');
jest.mock('../modules/reaction/reaction.service');
jest.mock('../modules/comment/comment.service');
jest.mock('../modules/bookmark/bookmark.service');
jest.mock('../config/redis', () => ({
  cacheClient: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
  pubClient: {},
  subClient: {},
}));
jest.mock('../config/socket', () => ({}));
jest.mock('../middlewares/rate-limit.middleware', () => ({
  authRateLimiter: (_r: unknown, _s: unknown, next: () => void) => next(),
  forgetPasswordRateLimiter: (_r: unknown, _s: unknown, next: () => void) =>
    next(),
  globalRateLimiter: (_r: unknown, _s: unknown, next: () => void) => next(),
}));
jest.mock('../middlewares/auth.middleware', () =>
  jest.fn(
    (..._roles: string[]) =>
      (
        req: express.Request,
        _res: express.Response,
        next: express.NextFunction,
      ) => {
        (req as express.Request & { user: unknown }).user = {
          _id: '507f1f77bcf86cd799439011',
          role: 'editor',
          name: 'Editor User',
          email: 'editor@example.com',
        };
        next();
      },
  ),
);
jest.mock('../middlewares/guest.middleware', () =>
  jest.fn(() => (_req: unknown, _res: unknown, next: () => void) => next()),
);
jest.mock('../middlewares/file.middleware', () =>
  jest.fn(
    () =>
      (req: { files?: unknown }, _res: unknown, next: () => void) => {
        req.files = {};
        next();
      },
  ),
);

import * as NewsService from '../modules/news/news.service';
import * as ReactionService from '../modules/reaction/reaction.service';
import * as CommentService from '../modules/comment/comment.service';
import { BookmarkService } from '../modules/bookmark/bookmark.service';
import app from '../app';

const agent = supertest(app);

const newsId = new mongoose.Types.ObjectId().toString();
const mockNews = {
  _id: newsId,
  title: 'Breaking News',
  slug: 'breaking-news',
  content: '<p>Full content here</p>',
  status: 'draft',
  author: '507f1f77bcf86cd799439011',
};

describe('News Content Flow Integration', () => {
  afterEach(() => jest.clearAllMocks());

  describe('POST /api/news — create draft', () => {
    it('creates a draft news article', async () => {
      (NewsService.createNews as jest.Mock).mockResolvedValue(mockNews);

      const res = await agent
        .post('/api/news')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Breaking News',
          slug: 'breaking-news',
          content: '<p>Full content here</p>',
          content_type: 'article',
        });

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
    });

    it('returns 400 when required fields are missing', async () => {
      const res = await agent
        .post('/api/news')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Only title' });

      expect(res.status).toBe(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /api/news/:id — get by id', () => {
    it('returns a news article by id', async () => {
      (NewsService.getNews as jest.Mock).mockResolvedValue(mockNews);

      const res = await agent
        .get(`/api/news/${newsId}`)
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PATCH /api/news/:id — update', () => {
    it('updates a news article', async () => {
      (NewsService.updateNews as jest.Mock).mockResolvedValue({
        ...mockNews,
        title: 'Updated Title',
      });

      const res = await agent
        .patch(`/api/news/${newsId}`)
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated Title' });

      expect(res.status).toBe(httpStatus.OK);
    });
  });

  describe('GET /api/news/:slug/public — public read', () => {
    it('returns published news by slug', async () => {
      (NewsService.getPublicNews as jest.Mock).mockResolvedValue({
        ...mockNews,
        status: 'published',
      });

      const res = await agent.get('/api/news/breaking-news/public');

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/reaction — react to news', () => {
    it('adds a reaction to a news article', async () => {
      (ReactionService.createReaction as jest.Mock).mockResolvedValue({
        type: 'like',
        news: newsId,
      });

      const res = await agent
        .post('/api/reaction')
        .set('Authorization', 'Bearer token')
        .send({ news: newsId, type: 'like' });

      expect(res.status).toBe(httpStatus.OK);
    });
  });

  describe('POST /api/comment — comment on news', () => {
    it('adds a comment to a news article', async () => {
      (CommentService.createComment as jest.Mock).mockResolvedValue({
        _id: new mongoose.Types.ObjectId().toString(),
        content: 'Great article!',
        news: newsId,
      });

      const res = await agent
        .post('/api/comment')
        .set('Authorization', 'Bearer token')
        .send({
          news: newsId,
          content: 'Great article!',
          name: 'Test User',
          email: 'test@example.com',
        });

      expect(res.status).toBe(httpStatus.OK);
    });
  });

  describe('POST /api/bookmark — bookmark news', () => {
    it('bookmarks a news article', async () => {
      (BookmarkService.createBookmark as jest.Mock).mockResolvedValue({
        _id: new mongoose.Types.ObjectId().toString(),
        news: newsId,
      });

      const res = await agent
        .post('/api/bookmark')
        .set('Authorization', 'Bearer token')
        .send({ news: newsId });

      expect(res.status).toBe(httpStatus.CREATED);
    });
  });

  describe('DELETE /api/news/:id — delete', () => {
    it('soft deletes a news article', async () => {
      (NewsService.deleteNews as jest.Mock).mockResolvedValue(undefined);

      const res = await agent
        .delete(`/api/news/${newsId}`)
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(httpStatus.OK);
    });
  });
});
