/**
 * media.route.spec.ts
 *
 * Integration tests for the Media HTTP routes.
 */

import express from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import supertest from 'supertest';

// ── Mock service and middlewares BEFORE importing routes ─────────────────────
jest.mock('../media.service');
jest.mock('../../../middlewares/auth.middleware', () => {
  return jest.fn(() => (req: any, _res: any, next: any) => {
    req.user = { _id: 'user123', role: 'admin' };
    next();
  });
});
jest.mock('../../../middlewares/validation.middleware', () => {
  return jest.fn(() => (_req: any, _res: any, next: any) => next());
});

import mediaRoutes from '../media.route';
import * as MediaService from '../media.service';

// ─── App Factory ──────────────────────────────────────────────────────────────

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/media', mediaRoutes);

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

describe('Media Routes', () => {
  const mockId = new mongoose.Types.ObjectId().toString();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/media', () => {
    it('should return 200 with paginated media', async () => {
      (MediaService.getBulkMedia as jest.Mock).mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, limit: 10 },
      });

      const res = await request.get('/api/media');

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(MediaService.getBulkMedia).toHaveBeenCalled();
    });
  });

  describe('GET /api/media/:id', () => {
    it('should return 200 with media details', async () => {
      (MediaService.getMedia as jest.Mock).mockResolvedValue({
        _id: mockId,
        title: 'Test Image',
      });

      const res = await request.get(`/api/media/${mockId}`);

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(MediaService.getMedia).toHaveBeenCalledWith(mockId);
    });
  });

  describe('POST /api/media', () => {
    it('should return 200 when media created', async () => {
      (MediaService.createMedia as jest.Mock).mockResolvedValue({
        _id: mockId,
        title: 'New Image',
      });

      const res = await request.post('/api/media').send({
        title: 'New Image',
        type: 'image',
        url: 'https://example.com/image.jpg',
        file: mockId,
        status: 'active',
      });

      expect(res.status).toBe(httpStatus.CREATED);
      expect(res.body.success).toBe(true);
      expect(MediaService.createMedia).toHaveBeenCalled();
    });
  });

  describe('PATCH /api/media/:id', () => {
    it('should return 200 when media updated', async () => {
      (MediaService.updateMedia as jest.Mock).mockResolvedValue({
        _id: mockId,
        title: 'Updated Image',
      });

      const res = await request
        .patch(`/api/media/${mockId}`)
        .send({ title: 'Updated Image' });

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(MediaService.updateMedia).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/media/:id', () => {
    it('should return 200 when media deleted', async () => {
      (MediaService.deleteMedia as jest.Mock).mockResolvedValue(undefined);

      const res = await request.delete(`/api/media/${mockId}`);

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(MediaService.deleteMedia).toHaveBeenCalledWith(mockId);
    });
  });
});
