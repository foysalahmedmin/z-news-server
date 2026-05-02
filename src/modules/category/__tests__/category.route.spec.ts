/**
 * category.route.test.ts
 *
 * Integration tests for the Category HTTP routes.
 * Tests are run against a real Express app instance (no live server needed).
 * The service layer is mocked so no DB / Redis connections are required.
 * Auth middleware is stubbed to allow role-based route access testing.
 */

import express from 'express';
import httpStatus from 'http-status';
import supertest from 'supertest';

// ── Mock service BEFORE importing routes ─────────────────────────────────────
jest.mock('../category.service');

// ── Mock auth middleware ──────────────────────────────────────────────────────
// By default: pass as 'admin'. Individual tests can override via mockAuth.
jest.mock('../../../middlewares/auth.middleware', () => {
  return jest.fn((..._roles: string[]) => {
    return (
      req: express.Request,
      _res: express.Response,
      next: express.NextFunction,
    ) => {
      (req as express.Request & { user: unknown }).user = {
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
    () =>
      (
        _req: express.Request,
        _res: express.Response,
        next: express.NextFunction,
      ) =>
        next(),
  );
});

import categoryRoutes from '../category.route';
import * as CategoryService from '../category.service';

// ─── App Factory ──────────────────────────────────────────────────────────────

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/category', categoryRoutes);

  // Global error handler (mirrors the real one)
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

const mockCategory = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Technology',
  slug: 'technology',
  sequence: 1,
  status: 'active',
  tags: [],
  is_featured: false,
};

const mockPaginated = {
  data: [mockCategory],
  meta: { total: 1, page: 1, limit: 10 },
};

// ─── GET /api/category/public ─────────────────────────────────────────────────

describe('GET /api/category/public', () => {
  it('should return 200 with public categories list', async () => {
    (CategoryService.getPublicCategories as jest.Mock).mockResolvedValue(
      mockPaginated,
    );

    const res = await request.get('/api/category/public');

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(CategoryService.getPublicCategories).toHaveBeenCalled();
  });
});

// ─── GET /api/category (admin) ────────────────────────────────────────────────

describe('GET /api/category (admin)', () => {
  it('should return 200 with all categories', async () => {
    (CategoryService.getCategories as jest.Mock).mockResolvedValue(
      mockPaginated,
    );

    const res = await request
      .get('/api/category')
      .set('Authorization', 'Bearer mock-token');

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });
});

// ─── GET /api/category/tree/public ───────────────────────────────────────────

describe('GET /api/category/tree/public', () => {
  it('should return 200 with tree data', async () => {
    (CategoryService.getPublicCategoriesTree as jest.Mock).mockResolvedValue(
      mockPaginated,
    );

    const res = await request.get('/api/category/tree/public');

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.success).toBe(true);
  });
});

// ─── GET /api/category/:slug/public ──────────────────────────────────────────

describe('GET /api/category/:slug/public', () => {
  it('should return 200 with a single category by slug', async () => {
    (CategoryService.getPublicCategory as jest.Mock).mockResolvedValue(
      mockCategory,
    );

    const res = await request.get('/api/category/technology/public');

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.data.slug).toBe('technology');
  });

  it('should return 404 when category slug does not exist', async () => {
    (CategoryService.getPublicCategory as jest.Mock).mockRejectedValue({
      status: httpStatus.NOT_FOUND,
      message: 'Category not found',
    });

    const res = await request.get('/api/category/non-existent/public');

    expect(res.status).toBe(httpStatus.NOT_FOUND);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /api/category ───────────────────────────────────────────────────────

describe('POST /api/category', () => {
  const newCategory = {
    name: 'Health',
    slug: 'health',
    sequence: 5,
    status: 'active',
    tags: [],
    is_featured: false,
  };

  it('should create a category and return 200', async () => {
    (CategoryService.createCategory as jest.Mock).mockResolvedValue({
      ...newCategory,
      _id: '507f1f77bcf86cd799439022',
    });

    const res = await request
      .post('/api/category')
      .set('Authorization', 'Bearer mock-token')
      .send(newCategory);

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe('health');
    expect(CategoryService.createCategory).toHaveBeenCalledWith(newCategory);
  });

  it('should handle service errors gracefully', async () => {
    (CategoryService.createCategory as jest.Mock).mockRejectedValue({
      status: httpStatus.BAD_REQUEST,
      message: 'Duplicate slug',
    });

    const res = await request
      .post('/api/category')
      .set('Authorization', 'Bearer mock-token')
      .send(newCategory);

    expect(res.status).toBe(httpStatus.BAD_REQUEST);
    expect(res.body.success).toBe(false);
  });
});

// ─── PATCH /api/category/:id ──────────────────────────────────────────────────

describe('PATCH /api/category/:id', () => {
  const id = '507f1f77bcf86cd799439011';

  it('should update a category and return 200', async () => {
    (CategoryService.updateCategory as jest.Mock).mockResolvedValue({
      ...mockCategory,
      name: 'Science',
    });

    const res = await request
      .patch(`/api/category/${id}`)
      .set('Authorization', 'Bearer mock-token')
      .send({ name: 'Science' });

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.data.name).toBe('Science');
  });

  it('should return 404 when category does not exist', async () => {
    (CategoryService.updateCategory as jest.Mock).mockRejectedValue({
      status: httpStatus.NOT_FOUND,
      message: 'Category not found',
    });

    const res = await request
      .patch(`/api/category/${id}`)
      .set('Authorization', 'Bearer mock-token')
      .send({ name: 'X' });

    expect(res.status).toBe(httpStatus.NOT_FOUND);
  });
});

// ─── DELETE /api/category/:id ─────────────────────────────────────────────────

describe('DELETE /api/category/:id', () => {
  const id = '507f1f77bcf86cd799439011';

  it('should soft-delete a category and return 200', async () => {
    (CategoryService.deleteCategory as jest.Mock).mockResolvedValue(undefined);

    const res = await request
      .delete(`/api/category/${id}`)
      .set('Authorization', 'Bearer mock-token');

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.success).toBe(true);
    expect(CategoryService.deleteCategory).toHaveBeenCalledWith(id);
  });

  it('should return 404 when category not found', async () => {
    (CategoryService.deleteCategory as jest.Mock).mockRejectedValue({
      status: httpStatus.NOT_FOUND,
      message: 'Category not found',
    });

    const res = await request
      .delete(`/api/category/${id}`)
      .set('Authorization', 'Bearer mock-token');

    expect(res.status).toBe(httpStatus.NOT_FOUND);
  });
});

// ─── DELETE /api/category/:id/permanent ──────────────────────────────────────

describe('DELETE /api/category/:id/permanent', () => {
  const id = '507f1f77bcf86cd799439011';

  it('should hard-delete a category and return 200', async () => {
    (CategoryService.deleteCategoryPermanent as jest.Mock).mockResolvedValue(
      undefined,
    );

    const res = await request
      .delete(`/api/category/${id}/permanent`)
      .set('Authorization', 'Bearer mock-token');

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.data).toBeNull();
  });
});

// ─── POST /api/category/:id/restore ──────────────────────────────────────────

describe('POST /api/category/:id/restore', () => {
  const id = '507f1f77bcf86cd799439011';

  it('should restore a deleted category and return 200', async () => {
    (CategoryService.restoreCategory as jest.Mock).mockResolvedValue(
      mockCategory,
    );

    const res = await request
      .post(`/api/category/${id}/restore`)
      .set('Authorization', 'Bearer mock-token');

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.data.slug).toBe('technology');
  });
});

// ─── PATCH /api/category/bulk ─────────────────────────────────────────────────

describe('PATCH /api/category/bulk', () => {
  it('should bulk-update categories and return 200', async () => {
    (CategoryService.updateCategories as jest.Mock).mockResolvedValue({
      count: 2,
      not_found_ids: [],
    });

    const res = await request
      .patch('/api/category/bulk')
      .set('Authorization', 'Bearer mock-token')
      .send({
        ids: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
        status: 'inactive',
      });

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.data.count ?? res.body.data).toBeDefined();
  });
});

// ─── DELETE /api/category/bulk ────────────────────────────────────────────────

describe('DELETE /api/category/bulk', () => {
  it('should bulk soft-delete and return 200', async () => {
    (CategoryService.deleteCategories as jest.Mock).mockResolvedValue({
      count: 1,
      not_found_ids: ['507f1f77bcf86cd799439099'],
    });

    const res = await request
      .delete('/api/category/bulk')
      .set('Authorization', 'Bearer mock-token')
      .send({ ids: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439099'] });

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.data.not_found_ids).toContain('507f1f77bcf86cd799439099');
  });
});
