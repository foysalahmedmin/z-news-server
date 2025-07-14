import httpStatus from 'http-status';
import { Document } from 'mongoose';
import AppError from '../../builder/AppError';
import AppQuery from '../../builder/AppQuery';
import { NotificationRecipient } from './notification-recipient.model';
import { TNotificationRecipient } from './notification-recipient.type';

export const createCategory = async (
  data: TNotificationRecipient,
): Promise<TNotificationRecipient> => {
  const result = await NotificationRecipient.create(data);
  return result.toObject();
};

export const getCategory = async (
  id: string,
): Promise<TNotificationRecipient> => {
  const result = await NotificationRecipient.findById(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }
  return result;
};

export const getCategories = async (
  query: Record<string, unknown>,
): Promise<{
  data: TNotificationRecipient[];
  meta: { total: number; page: number; limit: number };
}> => {
  const categoryQuery = new AppQuery<Document, TNotificationRecipient>(
    NotificationRecipient.find().lean(),
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
    Pick<TNotificationRecipient, 'name' | 'slug' | 'sequence' | 'status'>
  >,
): Promise<TNotificationRecipient> => {
  const data = await NotificationRecipient.findById(id).lean();
  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }

  const result = await NotificationRecipient.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result!;
};

export const updateCategories = async (
  ids: string[],
  payload: Partial<Pick<TNotificationRecipient, 'status'>>,
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const categories = await NotificationRecipient.find({
    _id: { $in: ids },
  }).lean();
  const foundIds = categories.map((category) => category._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await NotificationRecipient.updateMany(
    { _id: { $in: foundIds } },
    { ...payload },
  );

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};

export const deleteCategory = async (id: string): Promise<void> => {
  const category = await NotificationRecipient.findById(id);
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }

  await category.softDelete();
};

export const deleteCategoryPermanent = async (id: string): Promise<void> => {
  const category = await NotificationRecipient.findById(id).lean();
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }

  await NotificationRecipient.findByIdAndDelete(id);
};

export const deleteCategories = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const categories = await NotificationRecipient.find({
    _id: { $in: ids },
  }).lean();
  const foundIds = categories.map((category) => category._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await NotificationRecipient.updateMany(
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
  const categories = await NotificationRecipient.find({
    _id: { $in: ids },
  }).lean();
  const foundIds = categories.map((category) => category._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await NotificationRecipient.deleteMany({ _id: { $in: foundIds } });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const restoreCategory = async (
  id: string,
): Promise<TNotificationRecipient> => {
  const category = await NotificationRecipient.findOneAndUpdate(
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
  const result = await NotificationRecipient.updateMany(
    { _id: { $in: ids }, is_deleted: true },
    { is_deleted: false },
  );

  const restoredCategories = await NotificationRecipient.find({
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
