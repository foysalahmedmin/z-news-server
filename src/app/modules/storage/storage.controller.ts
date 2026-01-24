import httpStatus from 'http-status';
import { TStorageResult } from '../../middlewares/storage.middleware';
import catchAsync from '../../utils/catch-async';
import sendResponse from '../../utils/send-response';
import * as StorageServices from './storage.service';

export const createStorage = catchAsync(async (req, res) => {
  const storages = (req as any).storages as TStorageResult[];

  const result = await StorageServices.createStorage(
    req.user!,
    storages,
    req.body,
  );

  sendResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: 'Assets uploaded to cloud storage successfully',
    data: result,
  });
});

export const getStorage = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await StorageServices.getStorage(id);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Storage record retrieved successfully',
    data: result,
  });
});

export const getStorages = catchAsync(async (req, res) => {
  const result = await StorageServices.getStorages(req.query);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Storage records retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const getSelfStorages = catchAsync(async (req, res) => {
  const result = await StorageServices.getSelfStorages(req.user!, req.query);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Your storage records retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const updateStorage = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await StorageServices.updateStorage(id, req.body);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Storage record updated successfully',
    data: result,
  });
});

export const updateStorages = catchAsync(async (req, res) => {
  const { ids, ...payload } = req.body;
  const result = await StorageServices.updateStorages(ids, payload);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Storage records updated successfully',
    data: result,
  });
});

export const deleteStorage = catchAsync(async (req, res) => {
  const { id } = req.params;
  await StorageServices.deleteStorage(id);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Storage record soft deleted successfully',
    data: null,
  });
});

export const deleteStorages = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await StorageServices.deleteStorages(ids);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} records soft deleted successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});

export const deleteStoragePermanent = catchAsync(async (req, res) => {
  const { id } = req.params;
  await StorageServices.deleteStoragePermanent(id);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Storage record and cloud asset permanently deleted',
    data: null,
  });
});

export const deleteStoragesPermanent = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await StorageServices.deleteStoragesPermanent(ids);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} records and assets permanently deleted`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});

export const restoreStorage = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await StorageServices.restoreStorage(id);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Storage record restored successfully',
    data: result,
  });
});

export const restoreStorages = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await StorageServices.restoreStorages(ids);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} records restored successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});
