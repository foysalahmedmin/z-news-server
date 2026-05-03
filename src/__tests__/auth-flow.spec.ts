/**
 * Integration: Authentication Flow
 *
 * Tests the complete auth journey:
 *   signup → signin → refresh token → logout
 *
 * Services are mocked; validation middleware and error handler run real.
 */

import httpStatus from 'http-status';
import supertest from 'supertest';

jest.mock('../modules/auth/auth.service');
jest.mock('../config/redis', () => ({
  cacheClient: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
  pubClient: {},
  subClient: {},
}));
jest.mock('../config/socket', () => ({}));
jest.mock('../middlewares/rate-limit.middleware', () => ({
  authRateLimiter: (_r: unknown, _s: unknown, next: () => void) => next(),
  forgetPasswordRateLimiter: (_r: unknown, _s: unknown, next: () => void) =>
    next(),
  globalRateLimiter: (_r: unknown, _s: unknown, next: () => void) => next(),
}));
jest.mock('../middlewares/file.middleware', () =>
  jest.fn(
    () =>
      (req: { files?: unknown }, _res: unknown, next: () => void) => {
        req.files = {};
        next();
      },
  ),
);

import * as AuthService from '../modules/auth/auth.service';
import app from '../app';

const agent = supertest(app);

const mockTokens = {
  access_token: 'mock.access.token',
  refresh_token: 'mock.refresh.token',
  info: { _id: '507f1f77bcf86cd799439011', role: 'user', email: 'test@example.com' },
};

describe('Auth Flow Integration', () => {
  afterEach(() => jest.clearAllMocks());

  describe('POST /api/auth/signup', () => {
    it('registers a new user and returns 200', async () => {
      (AuthService.signup as jest.Mock).mockResolvedValue(mockTokens);

      const res = await agent.post('/api/auth/signup').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
    });

    it('returns 400 for missing required fields', async () => {
      const res = await agent
        .post('/api/auth/signup')
        .send({ email: 'bad-email' });

      expect(res.status).toBe(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /api/auth/signin', () => {
    it('signs in and returns tokens', async () => {
      (AuthService.signin as jest.Mock).mockResolvedValue(mockTokens);

      const res = await agent.post('/api/auth/signin').send({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
    });

    it('returns 400 for missing credentials', async () => {
      const res = await agent.post('/api/auth/signin').send({});
      expect(res.status).toBe(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    it('returns new access token for valid refresh token cookie', async () => {
      (AuthService.refreshToken as jest.Mock).mockResolvedValue({
        access_token: 'new.access.token',
        info: mockTokens.info,
      });

      const res = await agent
        .post('/api/auth/refresh-token')
        .set('Cookie', `refresh_token=${mockTokens.refresh_token}`);

      expect(res.status).toBe(httpStatus.OK);
    });

    it('returns 400 when refresh token cookie is missing', async () => {
      const res = await agent.post('/api/auth/refresh-token');
      expect(res.status).toBe(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('returns 200 on logout', async () => {
      (AuthService.logout as jest.Mock).mockResolvedValue(undefined);

      const res = await agent
        .post('/api/auth/logout')
        .send({ refresh_token: mockTokens.refresh_token });

      expect(res.status).toBe(httpStatus.OK);
    });
  });

  describe('POST /api/auth/forget-password', () => {
    it('sends reset email and returns 200', async () => {
      (AuthService.forgetPassword as jest.Mock).mockResolvedValue(undefined);

      const res = await agent
        .post('/api/auth/forget-password')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(httpStatus.OK);
    });

    it('returns 400 for invalid email format', async () => {
      const res = await agent
        .post('/api/auth/forget-password')
        .send({ email: 'not-an-email' });

      expect(res.status).toBe(httpStatus.BAD_REQUEST);
    });
  });
});
