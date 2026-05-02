/**
 * news-break.route.test.ts
 *
 * Integration tests for the NewsBreak HTTP routes.
 */

import express from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import supertest from 'supertest';

// ── Mock service and middlewares BEFORE importing routes ─────────────────────
jest.mock('../news-break.service');
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

import newsBreakRoutes from '../news-break.route';
import * as NewsBreakService from '../news-break.service';

// ─── App Factory ──────────────────────────────────────────────────────────────

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/news-break', newsBreakRoutes);

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

describe('NewsBreak Routes', () => {
  const mockId = new mongoose.Types.ObjectId().toString();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/news-break', () => {
    it('should return 200 when creation succeeds', async () => {
      (NewsBreakService.createNewsBreak as jest.Mock).mockResolvedValue({
        _id: mockId,
      });

      const res = await request.post('/api/news-break').send({
        news: mockId,
        status: 'published',
      });

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(NewsBreakService.createNewsBreak).toHaveBeenCalled();
    });
  });

  describe('GET /api/news-break/public', () => {
    it('should return 200 with public news-breaks', async () => {
      (NewsBreakService.getPublicNewsBreaks as jest.Mock).mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, limit: 10 },
      });

      const res = await request.get('/api/news-break/public');

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(NewsBreakService.getPublicNewsBreaks).toHaveBeenCalled();
    });
  });

  describe('GET /api/news-break/:id', () => {
    it('should return 200 with news-break details', async () => {
      (NewsBreakService.getNewsBreak as jest.Mock).mockResolvedValue({
        _id: mockId,
      });

      const res = await request.get(`/api/news-break/${mockId}`);

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(NewsBreakService.getNewsBreak).toHaveBeenCalledWith(mockId);
    });
  });

  describe('PATCH /api/news-break/:id', () => {
    it('should return 200 when update succeeds', async () => {
      (NewsBreakService.updateNewsBreak as jest.Mock).mockResolvedValue({
        _id: mockId,
      });

      const res = await request
        .patch(`/api/news-break/${mockId}`)
        .send({ status: 'archived' });

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(NewsBreakService.updateNewsBreak).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/news-break/:id', () => {
    it('should return 200 on soft delete', async () => {
      (NewsBreakService.deleteNewsBreak as jest.Mock).mockResolvedValue(
        undefined,
      );

      const res = await request.delete(`/api/news-break/${mockId}`);

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(NewsBreakService.deleteNewsBreak).toHaveBeenCalledWith(mockId);
    });
  });
});
