import httpStatus from 'http-status';
import { Types } from 'mongoose';
import AppError from '../../builder/AppError';
import AppQuery from '../../builder/AppQuery';
import { Category } from './category.model';
import { TCategory, TCategoryTree } from './category.type';
import { buildTree } from './category.utils';

export const createCategory = async (data: TCategory): Promise<TCategory> => {
  const result = await Category.create(data);
  return result.toObject();
};

export const getPublicCategory = async (slug: string): Promise<TCategory> => {
  const result = await Category.findOne({
    slug: slug,
    status: 'active',
  }).populate('children');
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }
  return result;
};

export const getCategory = async (id: string): Promise<TCategory> => {
  const result = await Category.findById(id).populate('children');
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }
  return result;
};

export const getPublicCategories = async (
  query: Record<string, unknown>,
): Promise<{
  data: TCategory[];
  meta: { total: number; page: number; limit: number };
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

  const categoryQuery = new AppQuery<TCategory>(
    Category.find(filter).populate([{ path: 'children' }]),
    rest,
  )
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  const result = await categoryQuery.execute();

  return result;
};

export const getCategories = async (
  query: Record<string, unknown>,
): Promise<{
  data: TCategory[];
  meta: { total: number; page: number; limit: number };
}> => {
  const { all = false, category, ...rest } = query;

  const filter: Record<string, unknown> = {};
  if (category) {
    filter.category = category;
  } else if (!all) {
    filter.category = { $not: { $type: 'objectId' } };
  }

  const categoryQuery = new AppQuery<TCategory>(
    Category.find(filter).populate([{ path: 'children' }]),
    rest,
  )
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  const result = await categoryQuery.execute();

  return result;
};

export const getPublicCategoriesTree = async (
  category?: string,
  query: { page?: number; limit?: number } = {},
): Promise<{
  data: TCategoryTree[];
  meta: { total: number; page: number; limit: number };
}> => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

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
      },
    },
    {
      $project: {
        combinedNodes: {
          $concatArrays: [['$$ROOT'], '$descendants'],
        },
      },
    },
    { $unwind: '$combinedNodes' },
    {
      $replaceRoot: { newRoot: '$combinedNodes' },
    },
    {
      $group: {
        _id: '$_id',
        doc: { $first: '$$ROOT' }, // deduplicate nodes
      },
    },
    {
      $replaceRoot: { newRoot: '$doc' },
    },
  ]);

  return {
    data: buildTree(categories, categories),
    meta: { total, page, limit },
  };
};

export const getCategoriesTree = async (
  category?: string,
  query: { page?: number; limit?: number } = {},
): Promise<{
  data: TCategoryTree[];
  meta: { total: number; page: number; limit: number };
}> => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;

  const baseMatch = {
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
      },
    },
    {
      $project: {
        combinedNodes: {
          $concatArrays: [['$$ROOT'], '$descendants'],
        },
      },
    },
    { $unwind: '$combinedNodes' },
    {
      $replaceRoot: { newRoot: '$combinedNodes' },
    },
    {
      $group: {
        _id: '$_id',
        doc: { $first: '$$ROOT' }, // deduplicate nodes
      },
    },
    {
      $replaceRoot: { newRoot: '$doc' },
    },
  ]);

  return {
    data: buildTree(categories, categories),
    meta: { total, page, limit },
  };
};

export const updateCategory = async (
  id: string,
  payload: Partial<Pick<TCategory, 'name' | 'slug' | 'sequence' | 'status'>>,
): Promise<TCategory> => {
  const data = await Category.findById(id).lean();
  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }

  const result = await Category.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result!;
};

export const updateCategories = async (
  ids: string[],
  payload: Partial<Pick<TCategory, 'status'>>,
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const categories = await Category.find({ _id: { $in: ids } }).lean();
  const foundIds = categories.map((category) => category._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await Category.updateMany(
    { _id: { $in: foundIds } },
    { ...payload },
  );

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};

export const deleteCategory = async (id: string): Promise<void> => {
  const category = await Category.findById(id);
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }

  await category.softDelete();
};

export const deleteCategoryPermanent = async (id: string): Promise<void> => {
  const category = await Category.findById(id).lean();
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }

  await Category.findByIdAndDelete(id);
};

export const deleteCategories = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const categories = await Category.find({ _id: { $in: ids } }).lean();
  const foundIds = categories.map((category) => category._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await Category.updateMany({ _id: { $in: foundIds } }, { is_deleted: true });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const deleteCategoriesPermanent = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const categories = await Category.find({ _id: { $in: ids } }).lean();
  const foundIds = categories.map((category) => category._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await Category.deleteMany({ _id: { $in: foundIds } });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const restoreCategory = async (id: string): Promise<TCategory> => {
  const category = await Category.findOneAndUpdate(
    { _id: id, is_deleted: true },
    { is_deleted: false },
    { new: true },
  );

  if (!category) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Category not found or not deleted',
    );
  }

  return category;
};

export const restoreCategories = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const result = await Category.updateMany(
    { _id: { $in: ids }, is_deleted: true },
    { is_deleted: false },
  );

  const restoredCategories = await Category.find({ _id: { $in: ids } }).lean();
  const restoredIds = restoredCategories.map((category) =>
    category._id.toString(),
  );
  const notFoundIds = ids.filter((id) => !restoredIds.includes(id));

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};
