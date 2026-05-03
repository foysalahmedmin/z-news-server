/**
 * Category Repository
 *
 * Handles ALL direct database interactions for the Category module.
 * The service layer must NEVER import from `category.model` directly;
 * it must go through this repository. This ensures:
 *  - Loose coupling between business logic and data access
 *  - Mockable DB layer for unit testing
 *  - A single place to change if the persistence layer changes
 */

import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';
import AppQueryFind from '../../builder/app-query-find';
import { Category } from './category.model';
import {
  TCategory,
  TCategoryDocument,
  TCategoryInput,
  TCategoryTree,
  TStatus,
} from './category.type';

// ─── Bulk Insert ─────────────────────────────────────────────────────────────

export const insertManyFromRaw = async (
  categories: TCategoryInput[],
): Promise<number> => {
  let sequenceCounter = 1;

  const formatted: TCategory[] = categories.map((cat) => ({
    _id: new ObjectId(Number(cat.category_id).toString(16).padStart(24, '0')),
    name: cat.category_name,
    slug: cat.category_name.toLowerCase().replace(/\s+/g, '-'),
    sequence: sequenceCounter++,
    status: 'active',
    is_featured: false,
    is_deleted: false,
    icon: 'blocks',
    layout: 'default',
    tags: [],
    description: '',
    ...(cat?.parent_id
      ? {
          category: new ObjectId(
            Number(cat.parent_id).toString(16).padStart(24, '0'),
          ),
        }
      : {}),
  }));

  await Category.insertMany(formatted, { ordered: false });
  return formatted.length;
};

// ─── Single Create ────────────────────────────────────────────────────────────

export const create = async (data: TCategory): Promise<TCategory> => {
  const result = await Category.create(data);
  return result.toObject();
};

// ─── Find One ────────────────────────────────────────────────────────────────

export const findBySlug = async (
  slug: string,
): Promise<TCategoryDocument | null> => {
  return await Category.findOne({ slug, status: 'active' }).populate(
    'children',
  );
};

export const findById = async (
  id: string,
): Promise<TCategoryDocument | null> => {
  return await Category.findById(id).populate('children');
};

export const findByIdLean = async (id: string): Promise<TCategory | null> => {
  return await Category.findById(id).lean();
};

export const findByIdWithDeleted = async (
  id: string,
): Promise<TCategory | null> => {
  return await Category.findById(id).setOptions({ bypassDeleted: true }).lean();
};

// ─── Find Many ────────────────────────────────────────────────────────────────

export const findManyByIds = async (ids: string[]): Promise<TCategory[]> => {
  return await Category.find({ _id: { $in: ids } }).lean();
};

export const findManyDeletedByIds = async (
  ids: string[],
): Promise<TCategory[]> => {
  return await Category.find({ _id: { $in: ids }, is_deleted: true })
    .setOptions({ bypassDeleted: true })
    .lean();
};

// ─── Paginated Lists ─────────────────────────────────────────────────────────

export const findPublicPaginated = async (
  query: Record<string, unknown>,
): Promise<{
  data: TCategory[];
  meta: { total: number; page: number; limit: number; total_pages: number };
}> => {
  const { all = false, category, ...rest } = query;

  const filter: Record<string, unknown> = {};
  if (category) {
    filter.status = 'active';
    filter.category = category;
  } else if (!all) {
    filter.status = 'active';
    filter.category = { $not: { $type: 'objectId' } };
  }

  const categoryQuery = new AppQueryFind(Category, { ...filter, ...rest })
    .populate([{ path: 'children' }])
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  return await categoryQuery.execute();
};

export const findAdminPaginated = async (
  query: Record<string, unknown>,
): Promise<{
  data: TCategory[];
  meta: { total: number; page: number; limit: number; total_pages: number };
}> => {
  const { all = false, category, ...rest } = query;

  if (category) {
    (rest as Record<string, unknown>).category = category;
  } else if (!all) {
    (rest as Record<string, unknown>).category = {
      $not: { $type: 'objectId' },
    };
  }

  const categoryQuery = new AppQueryFind(Category, rest)
    .populate([{ path: 'children' }])
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  return await categoryQuery.execute([
    { key: 'active', filter: { status: 'active' } },
    { key: 'inactive', filter: { status: 'inactive' } },
    { key: 'featured', filter: { is_featured: true } },
  ]);
};

// ─── Tree Queries ─────────────────────────────────────────────────────────────

export const findPublicTree = async (
  category?: string,
  query: { page?: number; limit?: number } = {},
): Promise<{
  data: TCategoryTree[];
  meta: { total: number; page: number; limit: number; total_pages: number };
}> => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 30;

  const baseMatch = {
    status: 'active',
    is_deleted: { $ne: true },
  };

  const matchStage =
    category && Types.ObjectId.isValid(category)
      ? { ...baseMatch, category: new Types.ObjectId(category) }
      : {
          ...baseMatch,
          $or: [{ category: { $exists: false } }, { category: null }],
        };

  const total = await Category.countDocuments(matchStage);

  const categories = await Category.aggregate([
    { $match: matchStage },
    { $sort: { sequence: 1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
    {
      $graphLookup: {
        from: 'categories',
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'category',
        as: 'descendants',
        restrictSearchWithMatch: baseMatch,
        depthField: 'level',
        maxDepth: 10,
      },
    },
    {
      $addFields: {
        children: {
          $filter: {
            input: '$descendants',
            as: 'child',
            cond: { $eq: ['$$child.level', 0] },
          },
        },
      },
    },
    { $project: { descendants: 0 } },
  ]);

  return {
    data: categories as TCategoryTree[],
    meta: { total, page, limit, total_pages: Math.ceil(total / limit) },
  };
};

export const findDescendantIds = async (
  category?: string,
  slug?: string,
): Promise<Types.ObjectId[]> => {
  if (!category && !slug) return [];

  const categories = await Category.aggregate([
    {
      $match: {
        $or: [
          ...(category ? [{ _id: new Types.ObjectId(category) }] : []),
          ...(slug ? [{ slug: slug }] : []),
        ],
      },
    },
    {
      $graphLookup: {
        from: 'categories',
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'category',
        as: 'descendants',
      },
    },
    {
      $project: {
        ids: {
          $concatArrays: [
            ['$_id'],
            { $map: { input: '$descendants', as: 'd', in: '$$d._id' } },
          ],
        },
      },
    },
  ]);

  if (!categories.length) return [];
  return (categories[0]?.ids as Types.ObjectId[]) || [];
};

export const findAdminTree = async (
  category?: string,
  query: { page?: number; limit?: number; status?: TStatus } = {},
): Promise<{
  data: TCategoryTree[];
  meta: { total: number; page: number; limit: number; total_pages: number };
}> => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 30;

  const baseMatch = {
    is_deleted: { $ne: true },
    ...(query?.status && { status: query?.status }),
  };

  const matchStage =
    category && Types.ObjectId.isValid(category)
      ? { ...baseMatch, category: new Types.ObjectId(category) }
      : {
          ...baseMatch,
          $or: [{ category: { $exists: false } }, { category: null }],
        };

  const total = await Category.countDocuments(matchStage);

  const categories = await Category.aggregate([
    { $match: matchStage },
    { $sort: { sequence: 1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
    {
      $graphLookup: {
        from: 'categories',
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'category',
        as: 'descendants',
        restrictSearchWithMatch: baseMatch,
        depthField: 'level',
        maxDepth: 10,
      },
    },
    {
      $addFields: {
        children: {
          $filter: {
            input: '$descendants',
            as: 'child',
            cond: { $eq: ['$$child.level', 0] },
          },
        },
      },
    },
    { $project: { descendants: 0 } },
  ]);

  return {
    data: categories as TCategoryTree[],
    meta: { total, page, limit, total_pages: Math.ceil(total / limit) },
  };
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateById = async (
  id: string,
  payload: Partial<TCategory>,
): Promise<TCategoryDocument | null> => {
  return await Category.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

export const updateManyByIds = async (
  ids: string[],
  payload: Partial<TCategory>,
): Promise<{ modifiedCount: number }> => {
  return await Category.updateMany({ _id: { $in: ids } }, { ...payload });
};

export const restoreById = async (
  id: string,
): Promise<TCategoryDocument | null> => {
  return await Category.findOneAndUpdate(
    { _id: id, is_deleted: true },
    { is_deleted: false },
    { new: true },
  );
};

export const restoreManyByIds = async (
  ids: string[],
): Promise<{ modifiedCount: number }> => {
  return await Category.updateMany(
    { _id: { $in: ids }, is_deleted: true },
    { is_deleted: false },
  );
};

export const softDeleteManyByIds = async (ids: string[]): Promise<void> => {
  await Category.updateMany({ _id: { $in: ids } }, { is_deleted: true });
};

// ─── Delete ───────────────────────────────────────────────────────────────────

export const hardDeleteById = async (id: string): Promise<void> => {
  await Category.findByIdAndDelete(id).setOptions({ bypassDeleted: true });
};

export const hardDeleteManyByIds = async (ids: string[]): Promise<void> => {
  await Category.deleteMany({
    _id: { $in: ids },
    is_deleted: true,
  }).setOptions({ bypassDeleted: true });
};

export const findRestoredByIds = async (
  ids: string[],
): Promise<TCategory[]> => {
  return await Category.find({ _id: { $in: ids } }).lean();
};
