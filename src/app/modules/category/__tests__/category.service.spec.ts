/**
 * category.service.test.ts
 *
 * Unit tests for the Category Service layer.
 * The repository is fully mocked so these tests run without a real DB connection.
 * This validates pure business logic: error conditions, cache invalidation calls,
 * data transformations, etc.
 */

import httpStatus from 'http-status';

// ── Mock the entire repository before importing the service ──────────────────
jest.mock('../category.repository');
jest.mock('../../../utils/cache.utils', () => ({
  withCache: jest.fn((_key: string, _ttl: number, fn: () => unknown) => fn()),
  invalidateCacheByPattern: jest.fn().mockResolvedValue(undefined),
  generateCacheKey: jest.fn(
    (_prefix: string, parts: unknown[]) => `mock:${parts.join(':')}`,
  ),
}));

import * as CategoryRepository from '../category.repository';
import * as CategoryService from '../category.service';
import { TCategory } from '../category.type';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockCategory = (): TCategory => ({
  _id: '507f1f77bcf86cd799439011' as unknown as never,
  name: 'Technology',
  slug: 'technology',
  sequence: 1,
  status: 'active',
  tags: [],
  is_featured: false,
  layout: 'default',
  icon: 'blocks',
});

const mockObjectId = (id: string) => ({ toString: () => id, _id: id });

// ─── createCategory ───────────────────────────────────────────────────────────

describe('CategoryService.createCategory', () => {
  it('should create a category and return it', async () => {
    const input = mockCategory();
    (CategoryRepository.create as jest.Mock).mockResolvedValue(input);

    const result = await CategoryService.createCategory(input);

    expect(CategoryRepository.create).toHaveBeenCalledWith(input);
    expect(result).toEqual(input);
  });

  it('should invalidate cache after creation', async () => {
    const { invalidateCacheByPattern } = jest.requireMock(
      '../../../utils/cache.utils',
    );
    (CategoryRepository.create as jest.Mock).mockResolvedValue(mockCategory());

    await CategoryService.createCategory(mockCategory());

    expect(invalidateCacheByPattern).toHaveBeenCalledWith('category:*');
  });
});

// ─── getPublicCategory ────────────────────────────────────────────────────────

describe('CategoryService.getPublicCategory', () => {
  it('should return a category when found by slug', async () => {
    const cat = mockCategory();
    (CategoryRepository.findBySlug as jest.Mock).mockResolvedValue(cat);

    const result = await CategoryService.getPublicCategory('technology');

    expect(CategoryRepository.findBySlug).toHaveBeenCalledWith('technology');
    expect(result).toEqual(cat);
  });

  it('should throw 404 AppError when slug not found', async () => {
    (CategoryRepository.findBySlug as jest.Mock).mockResolvedValue(null);

    await expect(
      CategoryService.getPublicCategory('unknown-slug'),
    ).rejects.toMatchObject({
      status: httpStatus.NOT_FOUND,
      message: 'Category not found',
    });
  });
});

// ─── getCategory ─────────────────────────────────────────────────────────────

describe('CategoryService.getCategory', () => {
  it('should return a category when found by id', async () => {
    const cat = mockCategory();
    (CategoryRepository.findById as jest.Mock).mockResolvedValue(cat);

    const result = await CategoryService.getCategory(
      '507f1f77bcf86cd799439011',
    );

    expect(result).toEqual(cat);
  });

  it('should throw 404 when id not found', async () => {
    (CategoryRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      CategoryService.getCategory('507f1f77bcf86cd799439099'),
    ).rejects.toMatchObject({
      status: httpStatus.NOT_FOUND,
    });
  });
});

// ─── updateCategory ───────────────────────────────────────────────────────────

describe('CategoryService.updateCategory', () => {
  it('should update and return updated category', async () => {
    const existing = mockCategory();
    const updated = { ...existing, name: 'Science' };

    (CategoryRepository.findByIdLean as jest.Mock).mockResolvedValue(existing);
    (CategoryRepository.updateById as jest.Mock).mockResolvedValue(updated);

    const result = await CategoryService.updateCategory(
      '507f1f77bcf86cd799439011',
      { name: 'Science' },
    );

    expect(CategoryRepository.findByIdLean).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
    );
    expect(CategoryRepository.updateById).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      { name: 'Science' },
    );
    expect(result.name).toBe('Science');
  });

  it('should throw 404 if category does not exist', async () => {
    (CategoryRepository.findByIdLean as jest.Mock).mockResolvedValue(null);

    await expect(
      CategoryService.updateCategory('507f1f77bcf86cd799439099', {
        name: 'X',
      }),
    ).rejects.toMatchObject({
      status: httpStatus.NOT_FOUND,
    });
    expect(CategoryRepository.updateById).not.toHaveBeenCalled();
  });
});

// ─── updateCategories ─────────────────────────────────────────────────────────

describe('CategoryService.updateCategories', () => {
  it('should update found categories and report not-found ids', async () => {
    const foundId = '507f1f77bcf86cd799439011';
    const missingId = '507f1f77bcf86cd799439099';

    (CategoryRepository.findManyByIds as jest.Mock).mockResolvedValue([
      { ...mockCategory(), _id: mockObjectId(foundId) },
    ]);
    (CategoryRepository.updateManyByIds as jest.Mock).mockResolvedValue({
      modifiedCount: 1,
    });

    const result = await CategoryService.updateCategories(
      [foundId, missingId],
      { status: 'inactive' },
    );

    expect(result.count).toBe(1);
    expect(result.not_found_ids).toEqual([missingId]);
  });
});

// ─── deleteCategory ───────────────────────────────────────────────────────────

describe('CategoryService.deleteCategory', () => {
  it('should call softDelete on the found category', async () => {
    const softDelete = jest.fn().mockResolvedValue(undefined);
    (CategoryRepository.findById as jest.Mock).mockResolvedValue({
      ...mockCategory(),
      softDelete,
    });

    await CategoryService.deleteCategory('507f1f77bcf86cd799439011');

    expect(softDelete).toHaveBeenCalled();
  });

  it('should throw 404 when category not found', async () => {
    (CategoryRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      CategoryService.deleteCategory('507f1f77bcf86cd799439099'),
    ).rejects.toMatchObject({ status: httpStatus.NOT_FOUND });
  });
});

// ─── deleteCategoryPermanent ──────────────────────────────────────────────────

describe('CategoryService.deleteCategoryPermanent', () => {
  it('should hard-delete a category that exists', async () => {
    (CategoryRepository.findByIdWithDeleted as jest.Mock).mockResolvedValue(
      mockCategory(),
    );
    (CategoryRepository.hardDeleteById as jest.Mock).mockResolvedValue(
      undefined,
    );

    await CategoryService.deleteCategoryPermanent('507f1f77bcf86cd799439011');

    expect(CategoryRepository.hardDeleteById).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
    );
  });

  it('should throw 404 when category not found', async () => {
    (CategoryRepository.findByIdWithDeleted as jest.Mock).mockResolvedValue(
      null,
    );

    await expect(
      CategoryService.deleteCategoryPermanent('507f1f77bcf86cd799439099'),
    ).rejects.toMatchObject({ status: httpStatus.NOT_FOUND });
  });
});

// ─── restoreCategory ──────────────────────────────────────────────────────────

describe('CategoryService.restoreCategory', () => {
  it('should restore a deleted category', async () => {
    const cat = mockCategory();
    (CategoryRepository.restoreById as jest.Mock).mockResolvedValue(cat);

    const result = await CategoryService.restoreCategory(
      '507f1f77bcf86cd799439011',
    );

    expect(result).toEqual(cat);
  });

  it('should throw 404 when category not found or not deleted', async () => {
    (CategoryRepository.restoreById as jest.Mock).mockResolvedValue(null);

    await expect(
      CategoryService.restoreCategory('507f1f77bcf86cd799439099'),
    ).rejects.toMatchObject({
      status: httpStatus.NOT_FOUND,
      message: 'Category not found or not deleted',
    });
  });
});

// ─── insertCategoriesFromFile ─────────────────────────────────────────────────

describe('CategoryService.insertCategoriesFromFile', () => {
  it('should throw 400 when no file is provided', async () => {
    await expect(
      CategoryService.insertCategoriesFromFile(undefined),
    ).rejects.toMatchObject({ status: httpStatus.BAD_REQUEST });
  });

  it('should parse JSON from file buffer and return count', async () => {
    const fakeCategories = [
      { category_id: '1', category_name: 'Tech' },
      { category_id: '2', category_name: 'Sports' },
    ];
    const fakeFile = {
      buffer: Buffer.from(JSON.stringify(fakeCategories)),
    } as Express.Multer.File;

    (CategoryRepository.insertManyFromRaw as jest.Mock).mockResolvedValue(2);

    const result = await CategoryService.insertCategoriesFromFile(fakeFile);

    expect(CategoryRepository.insertManyFromRaw).toHaveBeenCalledWith(
      fakeCategories,
    );
    expect(result).toEqual({ count: 2 });
  });
});

// ─── deleteCategories ─────────────────────────────────────────────────────────

describe('CategoryService.deleteCategories', () => {
  it('should soft-delete found ids and report missing ones', async () => {
    const foundId = '507f1f77bcf86cd799439011';
    const missingId = '507f1f77bcf86cd799439099';

    (CategoryRepository.findManyByIds as jest.Mock).mockResolvedValue([
      { ...mockCategory(), _id: mockObjectId(foundId) },
    ]);
    (CategoryRepository.softDeleteManyByIds as jest.Mock).mockResolvedValue(
      undefined,
    );

    const result = await CategoryService.deleteCategories([foundId, missingId]);

    expect(CategoryRepository.softDeleteManyByIds).toHaveBeenCalledWith([
      foundId,
    ]);
    expect(result).toEqual({ count: 1, not_found_ids: [missingId] });
  });
});
