/**
 * article-version.route.spec.ts
 *
 * Integration tests for the ArticleVersion HTTP routes.
 */

import express from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import supertest from 'supertest';

// ── Mock service and middlewares BEFORE importing routes ─────────────────────
jest.mock('../article-version.service');
jest.mock('../../../middlewares/auth.middleware', () => {
  return jest.fn(() => (req: any, _res: any, next: any) => {
    req.user = { _id: 'user123', role: 'admin' };
    next();
  });
});
jest.mock('../../../middlewares/validation.middleware', () => {
  return jest.fn(() => (_req: any, _res: any, next: any) => next());
});

import ArticleVersionRoutes from '../article-version.route';
import { ArticleVersionService } from '../article-version.service';

// ─── App Factory ──────────────────────────────────────────────────────────────

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/article-versions', ArticleVersionRoutes);

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

describe('ArticleVersion Routes', () => {
  const mockId = new mongoose.Types.ObjectId().toString();
  const mockNewsId = new mongoose.Types.ObjectId().toString();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/article-versions/news/:newsId', () => {
    it('should return 200 with versions for a news article', async () => {
      (
        ArticleVersionService.getVersionsByNewsId as jest.Mock
      ).mockResolvedValue([{ _id: mockId, version_number: 1 }]);

      const res = await request.get(`/api/article-versions/news/${mockNewsId}`);

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(ArticleVersionService.getVersionsByNewsId).toHaveBeenCalledWith(
        mockNewsId,
      );
    });
  });

  describe('GET /api/article-versions/:versionId', () => {
    it('should return 200 with a specific version', async () => {
      (ArticleVersionService.getVersionById as jest.Mock).mockResolvedValue({
        _id: mockId,
        version_number: 1,
      });

      const res = await request.get(`/api/article-versions/${mockId}`);

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(ArticleVersionService.getVersionById).toHaveBeenCalledWith(mockId);
    });
  });

  describe('POST /api/article-versions/:versionId/restore', () => {
    it('should return 200 when restore succeeds', async () => {
      (ArticleVersionService.restoreVersion as jest.Mock).mockResolvedValue({
        _id: mockNewsId,
        title: 'Restored',
      });

      const res = await request.post(`/api/article-versions/${mockId}/restore`);

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(ArticleVersionService.restoreVersion).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/article-versions/:versionId', () => {
    it('should return 200 on soft delete', async () => {
      (ArticleVersionService.deleteVersion as jest.Mock).mockResolvedValue({
        _id: mockId,
      });

      const res = await request.delete(`/api/article-versions/${mockId}`);

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(ArticleVersionService.deleteVersion).toHaveBeenCalledWith(mockId);
    });
  });
});
