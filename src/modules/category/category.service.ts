/**
 * Category Service
 *
 * Contains ONLY business logic. All database access is delegated to
 * `category.repository.ts`. This makes the service independently
 * unit-testable by mocking the repository.
 */

import httpStatus from 'http-status';
import AppError from '../../builder/app-error';
import {
  generateCacheKey,
  invalidateCacheByPattern,
  withCache,
} from '../../utils/cache.utils';
import * as CategoryRepository from './category.repository';
import { TCategory, TCategoryTree, TStatus } from './category.type';

const CACHE_PREFIX = 'category';
const CACHE_TTL = 3600; // 1 hour

// ─── Bulk Insert from File ────────────────────────────────────────────────────

export const insertCategoriesFromFile = async (
  file?: Express.Multer.File,
): Promise<{ count: number }> => {
  if (!file) {
    throw new AppError(httpStatus.BAD_REQUEST, 'No file uploaded');
  }

  const rawData = file.buffer.toString('utf-8');
  const categories = JSON.parse(rawData);

  const count = await CategoryRepository.insertManyFromRaw(categories);

  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);

  return { count };
};

// ─── Create ───────────────────────────────────────────────────────────────────

export const createCategory = async (data: TCategory): Promise<TCategory> => {
  const result = await CategoryRepository.create(data);
  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
  return result;
};

// ─── Get Single ───────────────────────────────────────────────────────────────

export const getPublicCategory = async (slug: string): Promise<TCategory> => {
  return await withCache(
    `${CACHE_PREFIX}:slug:${slug}`,
    CACHE_TTL,
    async () => {
      const result = await CategoryRepository.findBySlug(slug);
      if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
      }
      return result;
    },
  );
};

export const getCategory = async (id: string): Promise<TCategory> => {
  return await withCache(`${CACHE_PREFIX}:id:${id}`, CACHE_TTL, async () => {
    const result = await CategoryRepository.findById(id);
    if (!result) {
      throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
    }
    return result;
  });
};

// ─── Get Many ────────────────────────────────────────────────────────────────

export const getPublicCategories = async (
  query: Record<string, unknown>,
): Promise<{
  data: TCategory[];
  meta: { total: number; page: number; limit: number };
}> => {
  const cacheKey = generateCacheKey(CACHE_PREFIX, ['public', 'list', query]);
  return await withCache(cacheKey, CACHE_TTL, async () => {
    return await CategoryRepository.findPublicPaginated(query);
  });
};

export const getCategories = async (
  query: Record<string, unknown>,
): Promise<{
  data: TCategory[];
  meta: { total: number; page: number; limit: number };
}> => {
  const cacheKey = generateCacheKey(CACHE_PREFIX, ['list', query]);
  return await withCache(cacheKey, CACHE_TTL, async () => {
    return await CategoryRepository.findAdminPaginated(query);
  });
};

// ─── Get Tree ────────────────────────────────────────────────────────────────

export const getPublicCategoriesTree = async (
  category?: string,
  query: { page?: number; limit?: number } = {},
): Promise<{
  data: TCategoryTree[];
  meta: { total: number; page: number; limit: number };
}> => {
  const cacheKey = generateCacheKey(CACHE_PREFIX, [
    'public',
    'tree',
    category || 'root',
    query,
  ]);
  return await withCache(cacheKey, CACHE_TTL, async () => {
    return await CategoryRepository.findPublicTree(category, query);
  });
};

export const getCategoriesTree = async (
  category?: string,
  query: { page?: number; limit?: number; status?: TStatus } = {},
): Promise<{
  data: TCategoryTree[];
  meta: { total: number; page: number; limit: number };
}> => {
  const cacheKey = generateCacheKey(CACHE_PREFIX, [
    'tree',
    category || 'root',
    query,
  ]);
  return await withCache(cacheKey, CACHE_TTL, async () => {
    return await CategoryRepository.findAdminTree(category, query);
  });
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateCategory = async (
  id: string,
  payload: Partial<Pick<TCategory, 'name' | 'slug' | 'sequence' | 'status'>>,
): Promise<TCategory> => {
  // Guard: ensure the document exists before attempting update
  const exists = await CategoryRepository.findByIdLean(id);
  if (!exists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }

  const result = await CategoryRepository.updateById(id, payload);

  if (result) {
    await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
  }

  return result!;
};

export const updateCategories = async (
  ids: string[],
  payload: Partial<Pick<TCategory, 'status'>>,
): Promise<{ count: number; not_found_ids: string[] }> => {
  const categories = await CategoryRepository.findManyByIds(ids);
  const foundIds = categories.map((c) => c._id!.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await CategoryRepository.updateManyByIds(foundIds, payload);

  if (result.modifiedCount > 0) {
    await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
  }

  return { count: result.modifiedCount, not_found_ids: notFoundIds };
};

// ─── Soft Delete ──────────────────────────────────────────────────────────────

export const deleteCategory = async (id: string): Promise<void> => {
  const category = await CategoryRepository.findById(id);
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }

  await category.softDelete();
  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
};

export const deleteCategories = async (
  ids: string[],
): Promise<{ count: number; not_found_ids: string[] }> => {
  const categories = await CategoryRepository.findManyByIds(ids);
  const foundIds = categories.map((c) => c._id!.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await CategoryRepository.softDeleteManyByIds(foundIds);
  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);

  return { count: foundIds.length, not_found_ids: notFoundIds };
};

// ─── Hard Delete ──────────────────────────────────────────────────────────────

export const deleteCategoryPermanent = async (id: string): Promise<void> => {
  const category = await CategoryRepository.findByIdWithDeleted(id);
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }

  await CategoryRepository.hardDeleteById(id);
};

export const deleteCategoriesPermanent = async (
  ids: string[],
): Promise<{ count: number; not_found_ids: string[] }> => {
  const categories = await CategoryRepository.findManyDeletedByIds(ids);
  const foundIds = categories.map((c) => c._id!.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await CategoryRepository.hardDeleteManyByIds(foundIds);

  return { count: foundIds.length, not_found_ids: notFoundIds };
};

// ─── Restore ──────────────────────────────────────────────────────────────────

export const restoreCategory = async (id: string): Promise<TCategory> => {
  const category = await CategoryRepository.restoreById(id);
  if (!category) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Category not found or not deleted',
    );
  }

  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
  return category;
};

export const restoreCategories = async (
  ids: string[],
): Promise<{ count: number; not_found_ids: string[] }> => {
  const result = await CategoryRepository.restoreManyByIds(ids);

  const restoredCategories = await CategoryRepository.findRestoredByIds(ids);
  const restoredIds = restoredCategories.map((c) => c._id!.toString());
  const notFoundIds = ids.filter((id) => !restoredIds.includes(id));

  return { count: result.modifiedCount, not_found_ids: notFoundIds };
};
