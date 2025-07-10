import httpStatus from 'http-status';
import AppError from '../../builder/AppError';
import AppQuery from '../../builder/AppQuery';
import { Category } from './category.model';
import { TCategory, TCategoryDocument } from './category.type';

export const createCategory = async (data: TCategory): Promise<TCategory> => {
  const result = await Category.create(data);
  return result;
};

export const getCategory = async (id: string): Promise<TCategoryDocument> => {
  const result = await Category.findById(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }
  return result;
};

export const getCategories = async (
  query: Record<string, unknown>,
): Promise<{
  data: TCategoryDocument[];
  meta: { total: number; page: number; limit: number };
}> => {
  const categoryQuery = new AppQuery(Category.find(), query)
    .search(['name', 'email'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await categoryQuery.execute();

  return result;
};

export const updateCategory = async (
  id: string,
  payload: Partial<Pick<TCategory, 'name' | 'code' | 'sequence' | 'status'>>,
): Promise<TCategoryDocument> => {
  const data = await Category.findById(id);
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
  const categories = await Category.find({ _id: { $in: ids } });
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
  const category = await Category.findById(id);
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
  const categories = await Category.find({ _id: { $in: ids } });
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
  const categories = await Category.find({ _id: { $in: ids } });
  const foundIds = categories.map((category) => category._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await Category.deleteMany({ _id: { $in: foundIds } });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const restoreCategory = async (
  id: string,
): Promise<TCategoryDocument> => {
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

  const restoredCategories = await Category.find({ _id: { $in: ids } });
  const restoredIds = restoredCategories.map((category) =>
    category._id.toString(),
  );
  const notFoundIds = ids.filter((id) => !restoredIds.includes(id));

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};
