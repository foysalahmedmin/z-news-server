/**
 * event.route.test.ts
 *
 * Integration tests for the Event HTTP routes.
 */

import express from 'express';
import httpStatus from 'http-status';
import supertest from 'supertest';

// ── Mock service BEFORE importing routes ─────────────────────────────────────
jest.mock('../event.service');

// ── Mock auth middleware ──────────────────────────────────────────────────────
jest.mock('../../../middlewares/auth.middleware', () => {
  return jest.fn((..._roles: string[]) => {
    return (
      req: express.Request,
      _res: express.Response,
      next: express.NextFunction,
    ) => {
      (req as any).user = {
        _id: 'user123',
        role: 'admin',
        name: 'Admin User',
        email: 'admin@example.com',
      };
      next();
    };
  });
});

// ── Mock validation middleware (pass-through) ─────────────────────────────────
jest.mock('../../../middlewares/validation.middleware', () => {
  return jest.fn(
    () => (_req: any, _res: any, next: express.NextFunction) => next(),
  );
});

import eventRoutes from '../event.route';
import * as EventService from '../event.service';

// ─── App Factory ──────────────────────────────────────────────────────────────

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/event', eventRoutes);

  // Global error handler
  app.use(
    (
      err: { status?: number; message?: string },
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
      });
    },
  );

  return app;
};

const app = buildApp();
const request = supertest(app);

// ─── Shared mock data ─────────────────────────────────────────────────────────

const mockEvt = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Tech Event 2026',
  slug: 'tech-event-2026',
  status: 'active',
  is_featured: false,
};

const mockPaginated = {
  data: [mockEvt],
  meta: { total: 1, page: 1, limit: 10 },
};

// ─── GET /api/event/public ───────────────────────────────────────────────────

describe('GET /api/event/public', () => {
  it('should return 200 with public events list', async () => {
    (EventService.getPublicEvents as jest.Mock).mockResolvedValue(
      mockPaginated,
    );

    const res = await request.get('/api/event/public');

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });
});

// ─── GET /api/event/:slug/public ─────────────────────────────────────────────

describe('GET /api/event/:slug/public', () => {
  it('should return 200 with a single event by slug', async () => {
    (EventService.getPublicEvent as jest.Mock).mockResolvedValue(mockEvt);

    const res = await request.get('/api/event/tech-event-2026/public');

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.data.slug).toBe('tech-event-2026');
  });

  it('should return 404 when event slug does not exist', async () => {
    (EventService.getPublicEvent as jest.Mock).mockRejectedValue({
      status: httpStatus.NOT_FOUND,
      message: 'Event not found',
    });

    const res = await request.get('/api/event/non-existent/public');

    expect(res.status).toBe(httpStatus.NOT_FOUND);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /api/event ─────────────────────────────────────────────────────────

describe('POST /api/event', () => {
  it('should create an event and return 200', async () => {
    (EventService.createEvent as jest.Mock).mockResolvedValue({
      ...mockEvt,
      _id: '507f1f77bcf86cd799439022',
    });

    const res = await request
      .post('/api/event')
      .set('Authorization', 'Bearer mock-token')
      .send(mockEvt);

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.success).toBe(true);
    expect(EventService.createEvent).toHaveBeenCalled();
  });
});

// ─── PATCH /api/event/:id ────────────────────────────────────────────────────

describe('PATCH /api/event/:id', () => {
  it('should update an event and return 200', async () => {
    (EventService.updateEvent as jest.Mock).mockResolvedValue({
      ...mockEvt,
      name: 'Updated Event',
    });

    const res = await request
      .patch('/api/event/507f1f77bcf86cd799439011')
      .set('Authorization', 'Bearer mock-token')
      .send({ name: 'Updated Event' });

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.data.name).toBe('Updated Event');
  });
});

// ─── DELETE /api/event/:id ───────────────────────────────────────────────────

describe('DELETE /api/event/:id', () => {
  it('should soft-delete an event and return 200', async () => {
    (EventService.deleteEvent as jest.Mock).mockResolvedValue(undefined);

    const res = await request
      .delete('/api/event/507f1f77bcf86cd799439011')
      .set('Authorization', 'Bearer mock-token');

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.success).toBe(true);
  });
});
