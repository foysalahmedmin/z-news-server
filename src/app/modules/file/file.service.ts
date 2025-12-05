import httpStatus from 'http-status';
import { Model } from 'mongoose';
import AppError from '../../builder/AppError';
import AppQueryFind from '../../builder/AppQueryFind';
import { deleteFiles as deleteFilesFromDisk } from '../../utils/deleteFiles';
import { TJwtPayload } from '../auth/auth.type';
import { File } from './file.model';
import { TFile, TFileInput } from './file.type';
import { getExtensionFromFilename, getFileTypeFromMime } from './file.utils';

export const createFile = async (
  user: TJwtPayload,
  file: Express.Multer.File,
  payload: TFileInput,
  baseUrl: string = '',
): Promise<TFile> => {
  if (!file) {
    throw new AppError(httpStatus.BAD_REQUEST, 'No file uploaded');
  }

  const filePath = file.path.replace(/\\/g, '/');
  const extension = getExtensionFromFilename(file.filename);
  const fileType = getFileTypeFromMime(file.mimetype, extension);

  const fileData: Partial<TFile> = {
    file_name: file.filename,
    name: payload.name || file.originalname,
    url: `${baseUrl}/${filePath}`,
    path: filePath,
    type: fileType,
    mime_type: file.mimetype,
    size: file.size,
    extension: extension,
    author: user._id as any,
    category: payload.category,
    description: payload.description,
    caption: payload.caption,
    status: payload.status || 'active',
    is_deleted: false,
  };

  const result = await File.create(fileData);
  return result.toObject();
};

export const getFile = async (id: string): Promise<TFile> => {
  const result = await File.findById(id)
    .populate([{ path: 'author', select: '_id name email image' }])
    .lean();

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'File not found');
  }

  return result;
};

export const getFiles = async (
  query: Record<string, unknown>,
): Promise<{
  data: TFile[];
  meta: { total: number; page: number; limit: number };
}> => {
  const fileQuery = new AppQueryFind<TFile>(File as Model<TFile & import('mongoose').Document>, query)
    .populate([
      { path: 'author', select: '_id name email image' },
    ])
    .search(['name', 'file_name', 'description'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  const result = await fileQuery.execute([
    {
      key: 'active',
      filter: { status: 'active' },
    },
    {
      key: 'inactive',
      filter: { status: 'inactive' },
    },
    {
      key: 'archived',
      filter: { status: 'archived' },
    },
    {
      key: 'image',
      filter: { type: 'image' },
    },
    {
      key: 'video',
      filter: { type: 'video' },
    },
    {
      key: 'audio',
      filter: { type: 'audio' },
    },
    {
      key: 'pdf',
      filter: { type: 'pdf' },
    },
    {
      key: 'doc',
      filter: { type: 'doc' },
    },
    {
      key: 'txt',
      filter: { type: 'txt' },
    },
    {
      key: 'file',
      filter: { type: 'file' },
    },
  ]);

  return result;
};

export const getSelfFiles = async (
  user: TJwtPayload,
  query: Record<string, unknown>,
): Promise<{
  data: TFile[];
  meta: { total: number; page: number; limit: number };
}> => {
  const fileQuery = new AppQueryFind(File, { author: user._id, ...query })
    .populate([
      { path: 'author', select: '_id name email image' },
    ])
    .search(['name', 'file_name', 'description'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  const result = await fileQuery.execute();

  return result;
};

export const updateFile = async (
  id: string,
  payload: Partial<Pick<TFile, 'name' | 'description' | 'category' | 'caption' | 'status'>>,
): Promise<TFile> => {
  const data = await File.findById(id).lean();

  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'File not found');
  }

  const result = await File.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
    .populate([{ path: 'author', select: '_id name email image' }])
    .lean();

  return result!;
};

export const updateFiles = async (
  ids: string[],
  payload: Partial<Pick<TFile, 'status'>>,
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const files = await File.find({ _id: { $in: ids } }).lean();
  const foundIds = files.map((file) => file._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await File.updateMany(
    { _id: { $in: foundIds } },
    { ...payload },
  );

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};

export const deleteFile = async (id: string): Promise<void> => {
  const file = await File.findById(id);
  if (!file) {
    throw new AppError(httpStatus.NOT_FOUND, 'File not found');
  }

  await file.softDelete();
};

export const deleteFiles = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const files = await File.find({ _id: { $in: ids } }).lean();
  const foundIds = files.map((file) => file._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await File.updateMany({ _id: { $in: foundIds } }, { is_deleted: true });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const deleteFilePermanent = async (id: string): Promise<void> => {
  const file = await File.findById(id)
    .setOptions({ bypassDeleted: true })
    .lean();

  if (!file) {
    throw new AppError(httpStatus.NOT_FOUND, 'File not found');
  }

  // Delete physical file
  if (file.path) {
    await deleteFilesFromDisk(file.path);
  }

  await File.findByIdAndDelete(id).setOptions({ bypassDeleted: true });
};

export const deleteFilesPermanent = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const files = await File.find({
    _id: { $in: ids },
    is_deleted: true,
  })
    .setOptions({ bypassDeleted: true })
    .lean();

  const foundIds = files.map((file) => file._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  // Delete physical files
  const filePaths = files
    .map((file) => file.path)
    .filter((path): path is string => Boolean(path));

  if (filePaths.length > 0) {
    await deleteFilesFromDisk(filePaths);
  }

  await File.deleteMany({
    _id: { $in: foundIds },
    is_deleted: true,
  }).setOptions({ bypassDeleted: true });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const restoreFile = async (id: string): Promise<TFile> => {
  const file = await File.findOneAndUpdate(
    { _id: id, is_deleted: true },
    { is_deleted: false },
    { new: true },
  )
    .populate([{ path: 'author', select: '_id name email image' }])
    .lean();

  if (!file) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'File not found or not deleted',
    );
  }

  return file;
};

export const restoreFiles = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const result = await File.updateMany(
    { _id: { $in: ids }, is_deleted: true },
    { is_deleted: false },
  );

  const restoredFiles = await File.find({ _id: { $in: ids } }).lean();
  const restoredIds = restoredFiles.map((file) => file._id.toString());
  const notFoundIds = ids.filter((id) => !restoredIds.includes(id));

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};

