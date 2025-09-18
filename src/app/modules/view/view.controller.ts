import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import * as ViewServices from './view.service';

export const createView = catchAsync(async (req, res) => {
  const result = await ViewServices.createView(req.user, req.guest, req.body);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'View created successfully',
    data: result,
  });
});

export const getSelfNewsView = catchAsync(async (req, res) => {
  const { news_id } = req.params;
  const { data, meta } = await ViewServices.getSelfNewsView(
    req.user,
    req.guest,
    news_id,
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Reaction retrieved successfully',
    data: data,
    meta: meta,
  });
});

export const getSelfView = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ViewServices.getSelfView(req.user, req.guest, id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'View retrieved successfully',
    data: result,
  });
});

export const getView = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ViewServices.getView(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'View retrieved successfully',
    data: result,
  });
});

export const getSelfViews = catchAsync(async (req, res) => {
  const result = await ViewServices.getSelfViews(
    req.user,
    req.guest,
    req.query,
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Views retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const getViews = catchAsync(async (req, res) => {
  const result = await ViewServices.getViews(req.query);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Views retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const deleteSelfView = catchAsync(async (req, res) => {
  const { id } = req.params;
  await ViewServices.deleteSelfView(req.user, req.guest, id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'View soft deleted successfully',
    data: null,
  });
});

export const deleteView = catchAsync(async (req, res) => {
  const { id } = req.params;
  await ViewServices.deleteView(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'View soft deleted successfully',
    data: null,
  });
});

export const deleteSelfViews = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await ViewServices.deleteSelfViews(req.user, req.guest, ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} Views soft deleted successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});

export const deleteViews = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await ViewServices.deleteViews(ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} Views soft deleted successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});
