import httpStatus from 'http-status';
import { Document } from 'mongoose';
import AppError from '../../builder/AppError';
import AppQuery from '../../builder/AppQuery';
import { Notification } from './notification.model';
import { TNotification } from './notification.type';

export const createCategory = async (
  data: TNotification,
): Promise<TNotification> => {
  const result = await Notification.create(data);
  return result.toObject();
};

export const getCategory = async (id: string): Promise<TNotification> => {
  const result = await Notification.findById(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }
  return result;
};

export const getCategories = async (
  query: Record<string, unknown>,
): Promise<{
  data: TNotification[];
  meta: { total: number; page: number; limit: number };
}> => {
  const categoryQuery = new AppQuery<Document, TNotification>(
    Notification.find().lean(),
    query,
  )
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await categoryQuery.execute();

  return result;
};

export const updateCategory = async (
  id: string,
  payload: Partial<
    Pick<TNotification, 'name' | 'slug' | 'sequence' | 'status'>
  >,
): Promise<TNotification> => {
  const data = await Notification.findById(id).lean();
  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }

  const result = await Notification.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result!;
};

export const updateCategories = async (
  ids: string[],
  payload: Partial<Pick<TNotification, 'status'>>,
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const categories = await Notification.find({ _id: { $in: ids } }).lean();
  const foundIds = categories.map((category) => category._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await Notification.updateMany(
    { _id: { $in: foundIds } },
    { ...payload },
  );

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};

export const deleteCategory = async (id: string): Promise<void> => {
  const category = await Notification.findById(id);
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }

  await category.softDelete();
};

export const deleteCategoryPermanent = async (id: string): Promise<void> => {
  const category = await Notification.findById(id).lean();
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }

  await Notification.findByIdAndDelete(id);
};

export const deleteCategories = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const categories = await Notification.find({ _id: { $in: ids } }).lean();
  const foundIds = categories.map((category) => category._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await Notification.updateMany(
    { _id: { $in: foundIds } },
    { is_deleted: true },
  );

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
  const categories = await Notification.find({ _id: { $in: ids } }).lean();
  const foundIds = categories.map((category) => category._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await Notification.deleteMany({ _id: { $in: foundIds } });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const restoreCategory = async (id: string): Promise<TNotification> => {
  const category = await Notification.findOneAndUpdate(
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
  const result = await Notification.updateMany(
    { _id: { $in: ids }, is_deleted: true },
    { is_deleted: false },
  );

  const restoredCategories = await Notification.find({
    _id: { $in: ids },
  }).lean();
  const restoredIds = restoredCategories.map((category) =>
    category._id.toString(),
  );
  const notFoundIds = ids.filter((id) => !restoredIds.includes(id));

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};
