/**
 * view.route.test.ts
 *
 * Integration tests for the View HTTP routes.
 * The service layer is fully mocked.
 */

import express from 'express';
import httpStatus from 'http-status';
import supertest from 'supertest';

// ── Mock service ─────────────────────────────────────────────────────────────
jest.mock('../view.service');

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
      req.guest = { token: 'mock-token' };
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

import viewRoutes from '../view.route';
import * as ViewService from '../view.service';

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/view', viewRoutes);

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

const mockViewData = {
  _id: '507f1f77bcf86cd799439011',
  news: '507f1f77bcf86cd799439012',
  user: '507f1f77bcf86cd799439011',
};

// ─── POST /api/view ───────────────────────────────────────────────────────────

describe('POST /api/view', () => {
  it('should return 200 and create a view', async () => {
    (ViewService.createView as jest.Mock).mockResolvedValue(mockViewData);

    const res = await request
      .post('/api/view')
      .send({ news: '507f1f77bcf86cd799439012' });

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(mockViewData);
  });
});

// ─── GET /api/view/news/:news_id/self ─────────────────────────────────────────

describe('GET /api/view/news/:news_id/self', () => {
  it('should return view counts', async () => {
    const response = { data: null, meta: { views: 50 } };
    (ViewService.getSelfNewsView as jest.Mock).mockResolvedValue(response);

    const res = await request.get(
      '/api/view/news/507f1f77bcf86cd799439012/self',
    );

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.meta.views).toBe(50);
  });
});

// ─── GET /api/view/self ───────────────────────────────────────────────────────

describe('GET /api/view/self', () => {
  it('should return paginated self views', async () => {
    const paginated = {
      data: [mockViewData],
      meta: { total: 1, page: 1, limit: 10 },
    };
    (ViewService.getSelfViews as jest.Mock).mockResolvedValue(paginated);

    const res = await request.get('/api/view/self');

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(paginated.data);
  });
});

// ─── DELETE /api/view/:id/self ────────────────────────────────────────────────

describe('DELETE /api/view/:id/self', () => {
  it('should delete self view and return 200', async () => {
    (ViewService.deleteSelfView as jest.Mock).mockResolvedValue(undefined);

    const res = await request.delete('/api/view/507f1f77bcf86cd799439011/self');

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.success).toBe(true);
  });
});
