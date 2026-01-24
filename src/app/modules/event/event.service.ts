import httpStatus from 'http-status';
import AppError from '../../builder/app-error';
import AppQueryFind from '../../builder/app-query-find';
import {
  generateCacheKey,
  invalidateCacheByPattern,
  withCache,
} from '../../utils/cache.utils';
import { Event } from './event.model';
import { TEvent } from './event.type';

const CACHE_PREFIX = 'event';
const CACHE_TTL = 3600; // 1 hour

export const createEvent = async (data: TEvent): Promise<TEvent> => {
  const result = await Event.create(data);
  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
  return result.toObject();
};

export const getPublicEvent = async (slug: string): Promise<TEvent> => {
  return await withCache(
    generateCacheKey(CACHE_PREFIX, ['slug', slug]),
    CACHE_TTL,
    async () => {
      const result = await Event.findOne({
        slug: slug,
        status: 'active',
      }).populate([{ path: 'category', select: '_id name slug' }]);
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
      const result = await Event.findById(id).populate([
        { path: 'category', select: '_id name slug' },
      ]);
      if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Event not found');
      }
      return result;
    },
  );
};

export const getPublicEvents = async (
  query: Record<string, unknown>,
): Promise<{
  data: TEvent[];
  meta: { total: number; page: number; limit: number };
}> => {
  const cacheKey = generateCacheKey(CACHE_PREFIX, ['public', 'list', query]);
  return await withCache(cacheKey, CACHE_TTL, async () => {
    const { date: q_date, ...rest } = query || {};

    const date = q_date ? new Date(q_date as string) : new Date();

    const filter = {
      status: 'active',
      published_at: { $lte: date },
      $or: [{ expired_at: { $exists: false } }, { expired_at: { $gte: date } }],
    };

    const eventQuery = new AppQueryFind(Event, { ...filter, ...rest })
      .populate([{ path: 'category', select: '_id name slug' }])
      .search(['name'])
      .filter()
      .sort()
      .paginate()
      .fields()
      .tap((q) => q.lean());

    const result = await eventQuery.execute();

    return result;
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
    const eventQuery = new AppQueryFind(Event, query)
      .populate([{ path: 'category', select: '_id name slug' }])
      .search(['name'])
      .filter()
      .sort()
      .paginate()
      .fields()
      .tap((q) => q.lean());

    const result = await eventQuery.execute([
      {
        key: 'active',
        filter: { status: 'active' },
      },
      {
        key: 'inactive',
        filter: { status: 'inactive' },
      },
      {
        key: 'featured',
        filter: { is_featured: true },
      },
    ]);

    return result;
  });
};

export const updateEvent = async (
  id: string,
  payload: Partial<Pick<TEvent, 'name' | 'slug' | 'status'>>,
): Promise<TEvent> => {
  const data = await Event.findById(id).lean();

  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'Event not found');
  }

  const result = await Event.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

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
  const events = await Event.find({ _id: { $in: ids } }).lean();
  const foundIds = events.map((event) => event._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await Event.updateMany(
    { _id: { $in: foundIds } },
    { ...payload },
  );

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};

export const deleteEvent = async (id: string): Promise<void> => {
  const event = await Event.findById(id);
  if (!event) {
    throw new AppError(httpStatus.NOT_FOUND, 'Event not found');
  }

  await event.softDelete();
  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
};

export const deleteEventPermanent = async (id: string): Promise<void> => {
  const event = await Event.findById(id)
    .setOptions({ bypassDeleted: true })
    .lean();

  if (!event) {
    throw new AppError(httpStatus.NOT_FOUND, 'Event not found');
  }

  await Event.findByIdAndDelete(id).setOptions({ bypassDeleted: true });
};

export const deleteEvents = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const events = await Event.find({ _id: { $in: ids } }).lean();
  const foundIds = events.map((event) => event._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await Event.updateMany({ _id: { $in: foundIds } }, { is_deleted: true });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const deleteEventsPermanent = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const events = await Event.find({
    _id: { $in: ids },
    is_deleted: true,
  })
    .setOptions({ bypassDeleted: true })
    .lean();

  const foundIds = events.map((event) => event._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await Event.deleteMany({
    _id: { $in: foundIds },
    is_deleted: true,
  }).setOptions({ bypassDeleted: true });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const restoreEvent = async (id: string): Promise<TEvent> => {
  const event = await Event.findOneAndUpdate(
    { _id: id, is_deleted: true },
    { is_deleted: false },
    { new: true },
  );

  if (!event) {
    throw new AppError(httpStatus.NOT_FOUND, 'Event not found or not deleted');
  }

  return event;
};

export const restoreEvents = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const result = await Event.updateMany(
    { _id: { $in: ids }, is_deleted: true },
    { is_deleted: false },
  );

  const restoredEvents = await Event.find({ _id: { $in: ids } }).lean();
  const restoredIds = restoredEvents.map((event) => event._id.toString());
  const notFoundIds = ids.filter((id) => !restoredIds.includes(id));

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};
