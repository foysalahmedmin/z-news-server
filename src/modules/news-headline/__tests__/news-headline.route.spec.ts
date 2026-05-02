/**
 * news-headline.route.test.ts
 *
 * Integration tests for the NewsHeadline HTTP routes.
 */

import express from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import supertest from 'supertest';

// ── Mock service and middlewares BEFORE importing routes ─────────────────────
jest.mock('../news-headline.service');
jest.mock('../../../middlewares/auth.middleware', () => {
  return jest.fn(() => (req: any, _res: any, next: any) => {
    req.user = {
      _id: 'user123',
      role: 'admin',
    };
    next();
  });
});
jest.mock('../../../middlewares/validation.middleware', () => {
  return jest.fn(() => (_req: any, _res: any, next: any) => next());
});

import newsHeadlineRoutes from '../news-headline.route';
import * as NewsHeadlineService from '../news-headline.service';

// ─── App Factory ──────────────────────────────────────────────────────────────

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/news-headline', newsHeadlineRoutes);

  // Error handler
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

describe('NewsHeadline Routes', () => {
  const mockId = new mongoose.Types.ObjectId().toString();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/news-headline', () => {
    it('should return 200 when creation succeeds', async () => {
      (NewsHeadlineService.createNewsHeadline as jest.Mock).mockResolvedValue({
        _id: mockId,
      });

      const res = await request.post('/api/news-headline').send({
        news: mockId,
        status: 'published',
      });

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(NewsHeadlineService.createNewsHeadline).toHaveBeenCalled();
    });
  });

  describe('GET /api/news-headline/public', () => {
    it('should return 200 with public headlines', async () => {
      (
        NewsHeadlineService.getPublicNewsHeadlines as jest.Mock
      ).mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, limit: 10 },
      });

      const res = await request.get('/api/news-headline/public');

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(NewsHeadlineService.getPublicNewsHeadlines).toHaveBeenCalled();
    });
  });

  describe('GET /api/news-headline/:id', () => {
    it('should return 200 with headline details', async () => {
      (NewsHeadlineService.getNewsHeadline as jest.Mock).mockResolvedValue({
        _id: mockId,
      });

      const res = await request.get(`/api/news-headline/${mockId}`);

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(NewsHeadlineService.getNewsHeadline).toHaveBeenCalledWith(mockId);
    });
  });

  describe('PATCH /api/news-headline/:id', () => {
    it('should return 200 when update succeeds', async () => {
      (NewsHeadlineService.updateNewsHeadline as jest.Mock).mockResolvedValue({
        _id: mockId,
      });

      const res = await request
        .patch(`/api/news-headline/${mockId}`)
        .send({ status: 'archived' });

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(NewsHeadlineService.updateNewsHeadline).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/news-headline/:id', () => {
    it('should return 200 on soft delete', async () => {
      (NewsHeadlineService.deleteNewsHeadline as jest.Mock).mockResolvedValue(
        undefined,
      );

      const res = await request.delete(`/api/news-headline/${mockId}`);

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(NewsHeadlineService.deleteNewsHeadline).toHaveBeenCalledWith(
        mockId,
      );
    });
  });
});
