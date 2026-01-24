import { Storage } from '@google-cloud/storage';
import httpStatus from 'http-status';
import path from 'node:path';
import AppError from '../../builder/app-error';
import AppQueryFind from '../../builder/app-query-find';
import config from '../../config';
import { TStorageResult } from '../../middlewares/storage.middleware';
import { TJwtPayload } from '../../types/jsonwebtoken.type';
import { Asset } from './storage.model';
import { TStorage, TStorageInput } from './storage.type';

// Initialize GCS client for service methods
const storageClient = new Storage({
  ...(config.gcp.credentials_path && {
    keyFilename: path.resolve(process.cwd(), config.gcp.credentials_path),
  }),
  ...(config.gcp.project_id && {
    projectId: config.gcp.project_id,
  }),
});

export const createStorage = async (
  user: TJwtPayload,
  results: TStorageResult[],
  payload: TStorageInput,
): Promise<TStorage[]> => {
  if (!results || results.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'No storage results found');
  }

  const storagesData = results.map((result) => ({
    field_name: result.fieldName,
    original_name: result.originalName,
    file_name: result.filename,
    bucket: result.bucket,
    url: result.publicUrl || '',
    mimetype: result.mimetype,
    size: result.size,
    author: user._id as any,
    category: payload.category,
    description: payload.description,
    caption: payload.caption,
    status: payload.status || 'active',
    is_deleted: false,
  }));

  const result = await Asset.create(storagesData);
  return result.map((item) => item.toObject());
};

export const getStorage = async (id: string): Promise<TStorage> => {
  const result = await Asset.findById(id)
    .populate([{ path: 'author', select: '_id name email image' }])
    .lean();

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Storage record not found');
  }

  return result;
};

export const getStorages = async (
  query: Record<string, unknown>,
): Promise<{
  data: TStorage[];
  meta: { total: number; page: number; limit: number };
}> => {
  const storageQuery = new AppQueryFind(Asset, query)
    .populate([{ path: 'author', select: '_id name email image' }])
    .search(['file_name', 'original_name', 'description'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  const result = await storageQuery.execute();
  return result;
};

export const getSelfStorages = async (
  user: TJwtPayload,
  query: Record<string, unknown>,
): Promise<{
  data: TStorage[];
  meta: { total: number; page: number; limit: number };
}> => {
  const storageQuery = new AppQueryFind(Asset, {
    author: user._id,
    ...query,
  })
    .populate([{ path: 'author', select: '_id name email image' }])
    .search(['file_name', 'original_name', 'description'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  const result = await storageQuery.execute();
  return result;
};

export const updateStorage = async (
  id: string,
  payload: Partial<
    Pick<TStorage, 'description' | 'category' | 'caption' | 'status'>
  >,
): Promise<TStorage> => {
  const data = await Asset.findById(id).lean();

  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'Storage record not found');
  }

  const result = await Asset.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
    .populate([{ path: 'author', select: '_id name email image' }])
    .lean();

  return result!;
};

export const updateStorages = async (
  ids: string[],
  payload: Partial<Pick<TStorage, 'status'>>,
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const items = await Asset.find({ _id: { $in: ids } }).lean();
  const foundIds = items.map((item: any) => item._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await Asset.updateMany(
    { _id: { $in: foundIds } },
    { ...payload },
  );

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};

export const deleteStorage = async (id: string): Promise<void> => {
  const item = await Asset.findById(id);
  if (!item) {
    throw new AppError(httpStatus.NOT_FOUND, 'Storage record not found');
  }

  await item.softDelete();
};

export const deleteStorages = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const items = await Asset.find({ _id: { $in: ids } }).lean();
  const foundIds = items.map((item: any) => item._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await Asset.updateMany({ _id: { $in: foundIds } }, { is_deleted: true });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const deleteStoragePermanent = async (id: string): Promise<void> => {
  const item = await Asset.findById(id)
    .setOptions({ bypassDeleted: true })
    .lean();

  if (!item) {
    throw new AppError(httpStatus.NOT_FOUND, 'Storage record not found');
  }

  // Delete from GCS
  try {
    const bucket = storageClient.bucket(item.bucket);
    const file = bucket.file(item.file_name);
    await file.delete();
  } catch (error: any) {
    if (error.code !== 404) {
      console.error(`GCS Delete Error (${item.file_name}):`, error.message);
    }
  }

  await Asset.findByIdAndDelete(id).setOptions({ bypassDeleted: true });
};

export const deleteStoragesPermanent = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const items = await Asset.find({
    _id: { $in: ids },
    is_deleted: true,
  })
    .setOptions({ bypassDeleted: true })
    .lean();

  const foundIds = items.map((item: any) => item._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  // Batch delete from GCS
  for (const item of items) {
    try {
      const bucket = storageClient.bucket(item.bucket);
      const file = bucket.file(item.file_name);
      await file.delete();
    } catch (error: any) {
      if (error.code !== 404) {
        console.warn(
          `GCS Batch Delete Fail (${item.file_name}):`,
          error.message,
        );
      }
    }
  }

  await Asset.deleteMany({
    _id: { $in: foundIds },
    is_deleted: true,
  }).setOptions({ bypassDeleted: true });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const restoreStorage = async (id: string): Promise<TStorage> => {
  const item = await Asset.findOneAndUpdate(
    { _id: id, is_deleted: true },
    { is_deleted: false },
    { new: true },
  )
    .populate([{ path: 'author', select: '_id name email image' }])
    .lean();

  if (!item) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Storage record not found or not deleted',
    );
  }

  return item;
};

export const restoreStorages = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const result = await Asset.updateMany(
    { _id: { $in: ids }, is_deleted: true },
    { is_deleted: false },
  );

  const restored = await Asset.find({ _id: { $in: ids } }).lean();
  const restoredIds = restored.map((item: any) => item._id.toString());
  const notFoundIds = ids.filter((id) => !restoredIds.includes(id));

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};
