/**
 * bookmark.route.spec.ts
 *
 * Integration tests for the Bookmark HTTP routes.
 */

import express from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import supertest from 'supertest';

// ── Mock service and middlewares BEFORE importing routes ─────────────────────
jest.mock('../bookmark.service');
jest.mock('../../../middlewares/auth.middleware', () => {
  return jest.fn(() => (req: any, _res: any, next: any) => {
    req.user = { _id: 'user123', role: 'user' };
    next();
  });
});
jest.mock('../../../middlewares/validation.middleware', () => {
  return jest.fn(() => (_req: any, _res: any, next: any) => next());
});

import BookmarkRoutes from '../bookmark.route';
import { BookmarkService } from '../bookmark.service';

// ─── App Factory ──────────────────────────────────────────────────────────────

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/bookmark', BookmarkRoutes);

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

describe('Bookmark Routes', () => {
  const mockId = new mongoose.Types.ObjectId().toString();
  const mockListId = new mongoose.Types.ObjectId().toString();

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── BOOKMARK ROUTES ────────────────────────────────────────────────────────

  describe('POST /api/bookmark', () => {
    it('should return 201 when bookmark created', async () => {
      (BookmarkService.createBookmark as jest.Mock).mockResolvedValue({
        _id: mockId,
      });

      const res = await request.post('/api/bookmark').send({
        news: mockId,
      });

      expect(res.status).toBe(httpStatus.CREATED);
      expect(res.body.success).toBe(true);
      expect(BookmarkService.createBookmark).toHaveBeenCalled();
    });
  });

  describe('GET /api/bookmark', () => {
    it('should return 200 with user bookmarks', async () => {
      (BookmarkService.getMyBookmarks as jest.Mock).mockResolvedValue([
        { _id: mockId },
      ]);

      const res = await request.get('/api/bookmark');

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(BookmarkService.getMyBookmarks).toHaveBeenCalled();
    });
  });

  describe('GET /api/bookmark/:bookmarkId', () => {
    it('should return 200 with bookmark details', async () => {
      (BookmarkService.getBookmarkById as jest.Mock).mockResolvedValue({
        _id: mockId,
      });

      const res = await request.get(`/api/bookmark/${mockId}`);

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(BookmarkService.getBookmarkById).toHaveBeenCalled();
    });
  });

  describe('PATCH /api/bookmark/:bookmarkId', () => {
    it('should return 200 when bookmark updated', async () => {
      (BookmarkService.updateBookmark as jest.Mock).mockResolvedValue({
        _id: mockId,
        is_read: true,
      });

      const res = await request
        .patch(`/api/bookmark/${mockId}`)
        .send({ is_read: true });

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(BookmarkService.updateBookmark).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/bookmark/:bookmarkId', () => {
    it('should return 200 when bookmark deleted', async () => {
      (BookmarkService.deleteBookmark as jest.Mock).mockResolvedValue(
        undefined,
      );

      const res = await request.delete(`/api/bookmark/${mockId}`);

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(BookmarkService.deleteBookmark).toHaveBeenCalled();
    });
  });

  // ── READING LIST ROUTES ────────────────────────────────────────────────────

  describe('POST /api/bookmark/reading-list', () => {
    it('should return 201 when reading list created', async () => {
      (BookmarkService.createReadingList as jest.Mock).mockResolvedValue({
        _id: mockListId,
        name: 'My List',
      });

      const res = await request
        .post('/api/bookmark/reading-list')
        .send({ name: 'My List' });

      expect(res.status).toBe(httpStatus.CREATED);
      expect(res.body.success).toBe(true);
      expect(BookmarkService.createReadingList).toHaveBeenCalled();
    });
  });

  describe('GET /api/bookmark/reading-list/my', () => {
    it('should return 200 with user reading lists', async () => {
      (BookmarkService.getMyReadingLists as jest.Mock).mockResolvedValue([
        { _id: mockListId },
      ]);

      const res = await request.get('/api/bookmark/reading-list/my');

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(BookmarkService.getMyReadingLists).toHaveBeenCalled();
    });
  });

  describe('GET /api/bookmark/reading-list/public', () => {
    it('should return 200 with public reading lists', async () => {
      (BookmarkService.getPublicReadingLists as jest.Mock).mockResolvedValue([
        { _id: mockListId, is_public: true },
      ]);

      const res = await request.get('/api/bookmark/reading-list/public');

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(BookmarkService.getPublicReadingLists).toHaveBeenCalled();
    });
  });

  describe('GET /api/bookmark/reading-list/:listId', () => {
    it('should return 200 with reading list details', async () => {
      (BookmarkService.getReadingListById as jest.Mock).mockResolvedValue({
        _id: mockListId,
      });

      const res = await request.get(`/api/bookmark/reading-list/${mockListId}`);

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(BookmarkService.getReadingListById).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/bookmark/reading-list/:listId', () => {
    it('should return 200 when reading list deleted', async () => {
      (BookmarkService.deleteReadingList as jest.Mock).mockResolvedValue(
        undefined,
      );

      const res = await request.delete(
        `/api/bookmark/reading-list/${mockListId}`,
      );

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(BookmarkService.deleteReadingList).toHaveBeenCalled();
    });
  });
});
