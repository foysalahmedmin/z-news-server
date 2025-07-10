import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import * as NewsServices from './news.service';

export const createNews = catchAsync(async (req, res) => {
  const result = await NewsServices.createNews(req.user, req.body);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News created successfully',
    data: result,
  });
});

export const getSelfNews = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NewsServices.getSelfNews(req.user, id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News retrieved successfully',
    data: result,
  });
});

export const getNews = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NewsServices.getNews(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News retrieved successfully',
    data: result,
  });
});

export const getSelfBulkNews = catchAsync(async (req, res) => {
  const result = await NewsServices.getSelfBulkNews(req.user, req.query);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'All News are retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const getBulkNews = catchAsync(async (req, res) => {
  const result = await NewsServices.getBulkNews(req.query);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'All News are retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const updateSelfNews = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NewsServices.updateSelfNews(req.user, id, req.body);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News updated successfully',
    data: result,
  });
});

export const updateNews = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NewsServices.updateNews(id, req.body);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News updated successfully',
    data: result,
  });
});

export const updateSelfBulkNews = catchAsync(async (req, res) => {
  const { ids, ...payload } = req.body;
  const result = await NewsServices.updateSelfBulkNews(req.user, ids, payload);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News updated successfully',
    data: result,
  });
});

export const updateBulkNews = catchAsync(async (req, res) => {
  const { ids, ...payload } = req.body;
  const result = await NewsServices.updateBulkNews(ids, payload);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'All News are updated successfully',
    data: result,
  });
});

export const deleteSelfNews = catchAsync(async (req, res) => {
  const { id } = req.params;
  await NewsServices.deleteSelfNews(req.user, id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News soft deleted successfully',
    data: null,
  });
});

export const deleteNews = catchAsync(async (req, res) => {
  const { id } = req.params;
  await NewsServices.deleteNews(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News soft deleted successfully',
    data: null,
  });
});

export const deleteNewsPermanent = catchAsync(async (req, res) => {
  const { id } = req.params;
  await NewsServices.deleteNewsPermanent(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News permanently deleted successfully',
    data: null,
  });
});

export const deleteSelfBulkNews = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await NewsServices.deleteSelfBulkNews(req.user, ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} BulkNews soft deleted successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});

export const deleteBulkNews = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await NewsServices.deleteBulkNews(ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} BulkNews soft deleted successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});

export const deleteBulkNewsPermanent = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await NewsServices.deleteBulkNewsPermanent(ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} News are permanently deleted successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});

export const restoreSelfNews = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NewsServices.restoreSelfNews(req.user, id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News restored successfully',
    data: result,
  });
});

export const restoreNews = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NewsServices.restoreNews(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News restored successfully',
    data: result,
  });
});

export const restoreSelfBulkNews = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await NewsServices.restoreSelfBulkNews(req.user, ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} News are restored successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});

export const restoreBulkNews = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await NewsServices.restoreBulkNews(ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} News are restored successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});
