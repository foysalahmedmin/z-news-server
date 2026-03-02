/**
 * Event Service
 *
 * Business logic for the Event module. delegating DB access to the repository.
 */

import httpStatus from 'http-status';
import AppError from '../../builder/app-error';
import {
  generateCacheKey,
  invalidateCacheByPattern,
  withCache,
} from '../../utils/cache.utils';
import * as EventRepository from './event.repository';
import { TEvent } from './event.type';

const CACHE_PREFIX = 'event';
const CACHE_TTL = 3600; // 1 hour

// ─── Create ───────────────────────────────────────────────────────────────────

export const createEvent = async (data: TEvent): Promise<TEvent> => {
  const result = await EventRepository.create(data);
  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
  return result;
};

// ─── Get Single ───────────────────────────────────────────────────────────────

export const getPublicEvent = async (slug: string): Promise<TEvent> => {
  return await withCache(
    generateCacheKey(CACHE_PREFIX, ['slug', slug]),
    CACHE_TTL,
    async () => {
      const result = await EventRepository.findBySlug(slug);
      if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Event not found');
      }
      return result;
    },
  );
};

export const getEvent = async (id: string): Promise<TEvent> => {
  return await withCache(
    generateCacheKey(CACHE_PREFIX, ['id', id]),
    CACHE_TTL,
    async () => {
      const result = await EventRepository.findById(id);
      if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Event not found');
      }
      return result;
    },
  );
};

// ─── Get Many ────────────────────────────────────────────────────────────────

export const getPublicEvents = async (
  query: Record<string, unknown>,
): Promise<{
  data: TEvent[];
  meta: { total: number; page: number; limit: number };
}> => {
  const cacheKey = generateCacheKey(CACHE_PREFIX, ['public', 'list', query]);
  return await withCache(cacheKey, CACHE_TTL, async () => {
    return await EventRepository.findPublicPaginated(query);
  });
};

export const getEvents = async (
  query: Record<string, unknown>,
): Promise<{
  data: TEvent[];
  meta: { total: number; page: number; limit: number };
}> => {
  const cacheKey = generateCacheKey(CACHE_PREFIX, ['admin', 'list', query]);
  return await withCache(cacheKey, CACHE_TTL, async () => {
    return await EventRepository.findAdminPaginated(query);
  });
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateEvent = async (
  id: string,
  payload: Partial<Pick<TEvent, 'name' | 'slug' | 'status'>>,
): Promise<TEvent> => {
  const exists = await EventRepository.findByIdLean(id);
  if (!exists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Event not found');
  }

  const result = await EventRepository.updateById(id, payload);

  if (result) {
    await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
  }

  return result!;
};

export const updateEvents = async (
  ids: string[],
  payload: Partial<Pick<TEvent, 'status'>>,
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const events = await EventRepository.findManyByIds(ids);
  const foundIds = events.map((event) => event._id!.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await EventRepository.updateManyByIds(foundIds, payload);

  if (result.modifiedCount > 0) {
    await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
  }

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};

// ─── Soft Delete ──────────────────────────────────────────────────────────────

export const deleteEvent = async (id: string): Promise<void> => {
  const event = await EventRepository.findById(id);
  if (!event) {
    throw new AppError(httpStatus.NOT_FOUND, 'Event not found');
  }

  await event.softDelete();
  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
};

export const deleteEvents = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const events = await EventRepository.findManyByIds(ids);
  const foundIds = events.map((event) => event._id!.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await EventRepository.softDeleteManyByIds(foundIds);
  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

// ─── Hard Delete ──────────────────────────────────────────────────────────────

export const deleteEventPermanent = async (id: string): Promise<void> => {
  const event = await EventRepository.findByIdWithDeleted(id);
  if (!event) {
    throw new AppError(httpStatus.NOT_FOUND, 'Event not found');
  }

  await EventRepository.hardDeleteById(id);
};

export const deleteEventsPermanent = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const events = await EventRepository.findManyDeletedByIds(ids);
  const foundIds = events.map((event) => event._id!.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await EventRepository.hardDeleteManyByIds(foundIds);

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

// ─── Restore ──────────────────────────────────────────────────────────────────

export const restoreEvent = async (id: string): Promise<TEvent> => {
  const event = await EventRepository.restoreById(id);
  if (!event) {
    throw new AppError(httpStatus.NOT_FOUND, 'Event not found or not deleted');
  }

  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
  return event;
};

export const restoreEvents = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const result = await EventRepository.restoreManyByIds(ids);

  const restoredEvents = await EventRepository.findRestoredByIds(ids);
  const restoredIds = restoredEvents.map((event) => event._id!.toString());
  const notFoundIds = ids.filter((id) => !restoredIds.includes(id));

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};
