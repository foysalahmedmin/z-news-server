/**
 * news.route.spec.ts
 *
 * Integration tests for the News HTTP routes.
 */

import express from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import supertest from 'supertest';

// ── Mock service and middlewares BEFORE importing routes ─────────────────────
jest.mock('../news.service');
jest.mock('../../../middlewares/auth.middleware', () => {
  return jest.fn(() => (req: any, _res: any, next: any) => {
    req.user = { _id: 'user123', role: 'admin' };
    next();
  });
});
jest.mock('../../../middlewares/validation.middleware', () => {
  return jest.fn(() => (_req: any, _res: any, next: any) => next());
});
// Mock file middleware to avoid multer setup
jest.mock('../../../middlewares/file.middleware', () => {
  return jest.fn(() => (_req: any, _res: any, next: any) => next());
});

import NewsRoutes from '../news.route';
import * as NewsService from '../news.service';

// ─── App Factory ──────────────────────────────────────────────────────────────

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/news', NewsRoutes);

  app.use((err: any, _req: any, res: any, _next: any) => {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  });

  return app;
};

const app = buildApp();
const request = supertest(app);

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('News Routes', () => {
  const mockId = new mongoose.Types.ObjectId().toString();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/news/public', () => {
    it('should return 200 with public news list', async () => {
      (NewsService.getPublicBulkNews as jest.Mock).mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, limit: 10 },
      });

      const res = await request.get('/api/news/public');

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(NewsService.getPublicBulkNews).toHaveBeenCalled();
    });
  });

  describe('GET /api/news/:slug/public', () => {
    it('should return 200 with public news by slug', async () => {
      (NewsService.getPublicNews as jest.Mock).mockResolvedValue({
        title: 'Test News',
        slug: 'test-news',
      });

      const res = await request.get('/api/news/test-news/public');

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(NewsService.getPublicNews).toHaveBeenCalledWith('test-news');
    });
  });

  describe('GET /api/news/:id', () => {
    it('should return 200 with news details', async () => {
      (NewsService.getNews as jest.Mock).mockResolvedValue({
        _id: mockId,
        title: 'Test News',
      });

      const res = await request.get(`/api/news/${mockId}`);

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(NewsService.getNews).toHaveBeenCalledWith(mockId);
    });
  });

  describe('POST /api/news', () => {
    it('should return 200 when news created', async () => {
      (NewsService.createNews as jest.Mock).mockResolvedValue({
        _id: mockId,
        title: 'New Article',
      });

      const res = await request.post('/api/news').send({
        title: 'New Article',
        slug: 'new-article',
        content: '<p>Content</p>',
        status: 'draft',
      });

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(NewsService.createNews).toHaveBeenCalled();
    });
  });

  describe('PATCH /api/news/:id', () => {
    it('should return 200 when news updated', async () => {
      (NewsService.updateNews as jest.Mock).mockResolvedValue({
        _id: mockId,
        title: 'Updated Article',
      });

      const res = await request
        .patch(`/api/news/${mockId}`)
        .send({ title: 'Updated Article' });

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(NewsService.updateNews).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/news/:id', () => {
    it('should return 200 when news deleted', async () => {
      (NewsService.deleteNews as jest.Mock).mockResolvedValue(undefined);

      const res = await request.delete(`/api/news/${mockId}`);

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(NewsService.deleteNews).toHaveBeenCalledWith(mockId);
    });
  });
});
