import httpStatus from 'http-status';
import AppError from '../../builder/app-error';
import catchAsync from '../../utils/catch-async';
import sendResponse from '../../utils/send-response';
import * as FileServices from './file.service';

export const createFile = catchAsync(async (req, res) => {
  const files = req.files as Record<string, Express.Multer.File[]>;
  const file = files?.file?.[0];

  if (!file) {
    throw new AppError(httpStatus.BAD_REQUEST, 'No file uploaded');
  }

  const baseUrl = req.protocol + '://' + req.get('host');
  const result = await FileServices.createFile(
    req.user!,
    file,
    req.body,
    baseUrl,
  );

  sendResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: 'File uploaded successfully',
    data: result,
  });
});

export const getFile = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await FileServices.getFile(id);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'File retrieved successfully',
    data: result,
  });
});

export const getFiles = catchAsync(async (req, res) => {
  const result = await FileServices.getFiles(req.query);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Files retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const getSelfFiles = catchAsync(async (req, res) => {
  const result = await FileServices.getSelfFiles(req.user!, req.query);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Files retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const updateFile = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await FileServices.updateFile(id, req.body);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'File updated successfully',
    data: result,
  });
});

export const updateFiles = catchAsync(async (req, res) => {
  const { ids, ...payload } = req.body;
  const result = await FileServices.updateFiles(ids, payload);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Files updated successfully',
    data: result,
  });
});

export const deleteFile = catchAsync(async (req, res) => {
  const { id } = req.params;
  await FileServices.deleteFile(id);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'File soft deleted successfully',
    data: null,
  });
});

export const deleteFilePermanent = catchAsync(async (req, res) => {
  const { id } = req.params;
  await FileServices.deleteFilePermanent(id);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'File permanently deleted successfully',
    data: null,
  });
});

export const deleteFiles = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await FileServices.deleteFiles(ids);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} files soft deleted successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});

export const deleteFilesPermanent = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await FileServices.deleteFilesPermanent(ids);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} files permanently deleted successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});

export const restoreFile = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await FileServices.restoreFile(id);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'File restored successfully',
    data: result,
  });
});

export const restoreFiles = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await FileServices.restoreFiles(ids);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} files restored successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});

