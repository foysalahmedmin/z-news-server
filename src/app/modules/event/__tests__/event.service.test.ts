/**
 * event.service.test.ts
 *
 * Unit tests for the Event Service layer.
 */

import httpStatus from 'http-status';

// ── Mock the entire repository before importing the service ──────────────────
jest.mock('../event.repository');
jest.mock('../../../utils/cache.utils', () => ({
  withCache: jest.fn((_key: string, _ttl: number, fn: () => unknown) => fn()),
  invalidateCacheByPattern: jest.fn().mockResolvedValue(undefined),
  generateCacheKey: jest.fn(
    (_prefix: string, parts: unknown[]) => `mock:${parts.join(':')}`,
  ),
}));

import * as EventRepository from '../event.repository';
import * as EventService from '../event.service';
import { TEvent } from '../event.type';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockEvent = (): TEvent => ({
  _id: '507f1f77bcf86cd799439011',
  name: 'Tech Conference 2026',
  slug: 'tech-conference-2026',
  status: 'active',
  tags: ['tech', 'future'],
  is_featured: true,
  category: '507f1f77bcf86cd799439022' as any,
});

// ─── createEvent ─────────────────────────────────────────────────────────────

describe('EventService.createEvent', () => {
  it('should create an event and return it', async () => {
    const input = mockEvent();
    (EventRepository.create as jest.Mock).mockResolvedValue(input);

    const result = await EventService.createEvent(input);

    expect(EventRepository.create).toHaveBeenCalledWith(input);
    expect(result).toEqual(input);
  });

  it('should invalidate cache after creation', async () => {
    const { invalidateCacheByPattern } = jest.requireMock(
      '../../../utils/cache.utils',
    );
    (EventRepository.create as jest.Mock).mockResolvedValue(mockEvent());

    await EventService.createEvent(mockEvent());

    expect(invalidateCacheByPattern).toHaveBeenCalledWith('event:*');
  });
});

// ─── getPublicEvent ──────────────────────────────────────────────────────────

describe('EventService.getPublicEvent', () => {
  it('should return an event when found by slug', async () => {
    const evt = mockEvent();
    (EventRepository.findBySlug as jest.Mock).mockResolvedValue(evt);

    const result = await EventService.getPublicEvent('tech-conf');

    expect(EventRepository.findBySlug).toHaveBeenCalledWith('tech-conf');
    expect(result).toEqual(evt);
  });

  it('should throw 404 AppError when slug not found', async () => {
    (EventRepository.findBySlug as jest.Mock).mockResolvedValue(null);

    await expect(
      EventService.getPublicEvent('unknown-slug'),
    ).rejects.toMatchObject({
      status: httpStatus.NOT_FOUND,
      message: 'Event not found',
    });
  });
});

// ─── getEvent ───────────────────────────────────────────────────────────────

describe('EventService.getEvent', () => {
  it('should return an event when found by id', async () => {
    const evt = mockEvent();
    (EventRepository.findById as jest.Mock).mockResolvedValue(evt);

    const result = await EventService.getEvent('507f1f77bcf86cd799439011');

    expect(result).toEqual(evt);
  });

  it('should throw 404 when id not found', async () => {
    (EventRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      EventService.getEvent('507f1f77bcf86cd799439a99'),
    ).rejects.toMatchObject({
      status: httpStatus.NOT_FOUND,
    });
  });
});

// ─── updateEvent ─────────────────────────────────────────────────────────────

describe('EventService.updateEvent', () => {
  it('should update and return updated event', async () => {
    const existing = mockEvent();
    const updated = { ...existing, name: 'New Name' };

    (EventRepository.findByIdLean as jest.Mock).mockResolvedValue(existing);
    (EventRepository.updateById as jest.Mock).mockResolvedValue(updated);

    const result = await EventService.updateEvent('507f1f77bcf86cd799439011', {
      name: 'New Name',
    });

    expect(EventRepository.updateById).toHaveBeenCalled();
    expect(result.name).toBe('New Name');
  });

  it('should throw 404 if event does not exist', async () => {
    (EventRepository.findByIdLean as jest.Mock).mockResolvedValue(null);

    await expect(
      EventService.updateEvent('507f1f77bcf86cd799439a99', { name: 'X' }),
    ).rejects.toMatchObject({
      status: httpStatus.NOT_FOUND,
    });
  });
});

// ─── deleteEvent ─────────────────────────────────────────────────────────────

describe('EventService.deleteEvent', () => {
  it('should call softDelete on the found event', async () => {
    const softDelete = jest.fn().mockResolvedValue(undefined);
    (EventRepository.findById as jest.Mock).mockResolvedValue({
      ...mockEvent(),
      softDelete,
    });

    await EventService.deleteEvent('507f1f77bcf86cd799439011');

    expect(softDelete).toHaveBeenCalled();
  });
});

// ─── restoreEvent ────────────────────────────────────────────────────────────

describe('EventService.restoreEvent', () => {
  it('should restore a deleted event', async () => {
    const evt = mockEvent();
    (EventRepository.restoreById as jest.Mock).mockResolvedValue(evt);

    const result = await EventService.restoreEvent('507f1f77bcf86cd799439011');

    expect(result).toEqual(evt);
  });
});

// ─── Bulk Operations ─────────────────────────────────────────────────────────

describe('EventService.updateEvents', () => {
  it('should update found events and report missing ones', async () => {
    const foundId = '507f1f77bcf86cd799439011';
    const missingId = '507f1f77bcf86cd799439999';

    (EventRepository.findManyByIds as jest.Mock).mockResolvedValue([
      { ...mockEvent(), _id: foundId },
    ]);
    (EventRepository.updateManyByIds as jest.Mock).mockResolvedValue({
      modifiedCount: 1,
    });

    const result = await EventService.updateEvents([foundId, missingId], {
      status: 'inactive',
    });

    expect(result.count).toBe(1);
    expect(result.not_found_ids).toContain(missingId);
  });
});

describe('EventService.deleteEvents', () => {
  it('should soft-delete found events', async () => {
    const ids = ['id1', 'id2'];
    (EventRepository.findManyByIds as jest.Mock).mockResolvedValue([
      { ...mockEvent(), _id: 'id1' },
      { ...mockEvent(), _id: 'id2' },
    ]);

    const result = await EventService.deleteEvents(ids);

    expect(EventRepository.softDeleteManyByIds).toHaveBeenCalledWith([
      'id1',
      'id2',
    ]);
    expect(result.count).toBe(2);
  });
});
