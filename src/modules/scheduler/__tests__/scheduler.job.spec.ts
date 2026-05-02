/**
 * scheduler.job.spec.ts
 *
 * Tests for the scheduler background job functions.
 */

// Mock the News model before importing scheduler
jest.mock('../../news/news.model', () => ({
  News: {
    updateMany: jest.fn(),
  },
}));

// Mock setInterval to avoid actually setting timers
const mockSetInterval = jest
  .spyOn(global, 'setInterval')
  .mockImplementation(() => 0 as unknown as NodeJS.Timeout);

import { initScheduler } from '../scheduler.job';
import { News } from '../../news/news.model';

describe('Scheduler Job', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockSetInterval.mockRestore();
  });

  describe('initScheduler', () => {
    it('should initialize the scheduler without throwing', () => {
      (News.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 0 });

      expect(() => initScheduler()).not.toThrow();
    });

    it('should call setInterval to schedule recurring jobs', () => {
      (News.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 0 });

      initScheduler();

      expect(mockSetInterval).toHaveBeenCalledWith(
        expect.any(Function),
        60 * 1000,
      );
    });
  });

  describe('publish scheduled news', () => {
    it('should update scheduled news to published when published_at has passed', async () => {
      (News.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 2 });

      // Trigger the scheduler which calls runScheduledJobs internally
      initScheduler();

      // Allow the async runScheduledJobs() call to execute
      await Promise.resolve();

      expect(News.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'scheduled',
          published_at: expect.objectContaining({ $lte: expect.any(Date) }),
        }),
        expect.objectContaining({ $set: { status: 'published' } }),
      );
    });
  });

  describe('archive expired news', () => {
    it('should update published news to archived when expired_at has passed', async () => {
      (News.updateMany as jest.Mock)
        .mockResolvedValueOnce({ modifiedCount: 0 }) // publish job
        .mockResolvedValueOnce({ modifiedCount: 3 }); // archive job

      initScheduler();

      // Allow the async runScheduledJobs() call to execute
      await Promise.resolve();

      expect(News.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'published',
          expired_at: expect.objectContaining({ $lt: expect.any(Date) }),
        }),
        expect.objectContaining({ $set: { status: 'archived' } }),
      );
    });
  });

  describe('error handling', () => {
    it('should not throw if News.updateMany rejects', async () => {
      (News.updateMany as jest.Mock).mockRejectedValue(
        new Error('DB connection failed'),
      );

      expect(() => initScheduler()).not.toThrow();

      // Allow promise to settle without bubbling the error
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });
});
