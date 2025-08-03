import httpStatus from 'http-status';
import { Document, Types } from 'mongoose';
import AppError from '../../builder/AppError';
import AppQuery from '../../builder/AppQuery';
import { Category } from './category.model';
import { TCategory, TCategoryTree } from './category.type';
import { buildTree } from './category.utils';

export const createCategory = async (data: TCategory): Promise<TCategory> => {
  const result = await Category.create(data);
  return result.toObject();
};

export const getCategory = async (id: string): Promise<TCategory> => {
  const result = await Category.findById(id).populate('children');
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }
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

  const categoryQuery = new AppQuery<Document, TCategory>(
    Category.find(filter).populate([{ path: 'children' }]),
    rest,
  )
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .lean();

  const result = await categoryQuery.execute();

  return result;
};

export const getCategoriesTree = async (
  categoryId?: string,
  query: { page?: number; limit?: number } = {},
): Promise<{
  data: TCategoryTree[];
  meta: { total: number; page: number; limit: number };
}> => {
  const { page = 1, limit = 10 } = query;

  const matchStage = categoryId
    ? { category: categoryId }
    : { category: { $not: { $type: 'objectId' } } };

  // First count total roots for meta
  const total = await Category.countDocuments(matchStage);

  // Aggregation with pagination on root categories
  const rawRoots = await Category.aggregate([
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
      },
    },
  ]);

  const allNodes = rawRoots.flatMap((root) => [
    root,
    ...(root.descendants || []),
  ]);
  const uniqueNodes = Array.from(
    new Map(allNodes.map((n) => [String(n._id), n])).values(),
  );

  return {
    data: buildTree(rawRoots, uniqueNodes),
    meta: { total, page, limit },
  };
};

export const getCategoriesTreePublic = async (
  categoryId?: string,
  query: { page?: number | string; limit?: number | string } = {},
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
    categoryId && Types.ObjectId.isValid(categoryId)
      ? { ...baseMatch, category: new Types.ObjectId(categoryId) }
      : {
          ...baseMatch,
          $or: [{ category: { $exists: false } }, { category: null }],
        };

  try {
    const total = await Category.countDocuments(matchStage);

    const rawRoots = await Category.aggregate([
      { $match: matchStage },
      { $skip: (page - 1) * limit },
      { $limit: limit }, // ✅ now a number
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
    ]);

    const allNodes = rawRoots.flatMap((root) => [
      root,
      ...(root.descendants || []),
    ]);
    const uniqueNodes = Array.from(
      new Map(allNodes.map((n) => [String(n._id), n])).values(),
    );

    return {
      data: buildTree(rawRoots, uniqueNodes),
      meta: { total, page, limit },
    };
  } catch (err) {
    console.error('🔥 Error in getCategoriesTreePublic:', err);
    throw new Error('Failed to fetch category tree');
  }
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
