/**
 * guest.route.test.ts
 *
 * Integration tests for the Guest HTTP routes.
 * The service layer is fully mocked.
 */

import express from 'express';
import httpStatus from 'http-status';
import { Types } from 'mongoose';
import supertest from 'supertest';

// ── Mock service ─────────────────────────────────────────────────────────────
jest.mock('../guest.service');

// ── Stub middlewares ──────────────────────────────────────────────────────────
jest.mock('../../../middlewares/auth.middleware', () => {
  return jest.fn((..._roles: string[]) => {
    return (req: any, _res: any, next: any) => {
      req.user = {
        _id: '507f1f77bcf86cd799439011',
        role: 'admin',
        name: 'Admin User',
        email: 'admin@example.com',
      };
      // For /self tests, we might need req.guest if auth middleware supports it
      req.guest = {
        _id: new Types.ObjectId('507f1f77bcf86cd799439014'),
        token: 'mock-token',
      };
      next();
    };
  });
});

jest.mock('../../../middlewares/validation.middleware', () => {
  return jest.fn(() => (_req: any, _res: any, next: any) => next());
});

import guestRoutes from '../guest.route';
import * as GuestService from '../guest.service';

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/guest', guestRoutes);

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

const mockGuestData = {
  _id: '507f1f77bcf86cd799439014',
  token: 'mock-token',
  session_id: 'session-id',
  status: 'in-progress',
};

// ─── GET /api/guest/self ──────────────────────────────────────────────────────

describe('GET /api/guest/self', () => {
  it('should return 200 and guest data', async () => {
    (GuestService.getSelf as jest.Mock).mockResolvedValue(mockGuestData);

    const res = await request.get('/api/guest/self');

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(mockGuestData);
  });
});

// ─── GET /api/guest (admin) ───────────────────────────────────────────────────

describe('GET /api/guest', () => {
  it('should return 200 and paginated guests', async () => {
    const paginated = {
      data: [mockGuestData],
      meta: { total: 1, page: 1, limit: 10 },
    };
    (GuestService.getGuests as jest.Mock).mockResolvedValue(paginated);

    const res = await request.get('/api/guest');

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(paginated.data);
  });
});

// ─── PATCH /api/guest/self ────────────────────────────────────────────────────

describe('PATCH /api/guest/self', () => {
  it('should update self and return 200', async () => {
    const updated = { ...mockGuestData, name: 'Guest User' };
    (GuestService.updateSelf as jest.Mock).mockResolvedValue(updated);

    const res = await request
      .patch('/api/guest/self')
      .send({ name: 'Guest User' });

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.data.name).toBe('Guest User');
  });
});

// ─── DELETE /api/guest/:id ─────────────────────────────────────────────────────

describe('DELETE /api/guest/:id', () => {
  it('should soft delete guest and return 200', async () => {
    (GuestService.deleteGuest as jest.Mock).mockResolvedValue(undefined);

    const res = await request.delete('/api/guest/507f1f77bcf86cd799439014');

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.success).toBe(true);
  });
});

// ─── POST /api/guest/:id/restore ──────────────────────────────────────────────

describe('POST /api/guest/:id/restore', () => {
  it('should restore guest and return 200', async () => {
    (GuestService.restoreGuest as jest.Mock).mockResolvedValue(mockGuestData);

    const res = await request.post(
      '/api/guest/507f1f77bcf86cd799439014/restore',
    );

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.success).toBe(true);
  });
});
