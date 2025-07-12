import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import * as NewsServices from './news-headline.service';

export const createNewsHeadline = catchAsync(async (req, res) => {
  const result = await NewsServices.createNewsHeadline(req.user, req.body);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News created successfully',
    data: result,
  });
});

export const getSelfNewsHeadline = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NewsServices.getSelfNewsHeadline(req.user, id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News retrieved successfully',
    data: result,
  });
});

export const getNewsHeadline = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NewsServices.getNewsHeadline(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News retrieved successfully',
    data: result,
  });
});

export const getSelfNewsHeadlineHeadlines = catchAsync(async (req, res) => {
  const result = await NewsServices.getSelfNewsHeadlineHeadlines(
    req.user,
    req.query,
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'All News are retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const getNewsHeadlines = catchAsync(async (req, res) => {
  const result = await NewsServices.getNewsHeadlines(req.query);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'All News are retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const updateSelfNewsHeadline = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NewsServices.updateSelfNewsHeadline(
    req.user,
    id,
    req.body,
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News updated successfully',
    data: result,
  });
});

export const updateNewsHeadline = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NewsServices.updateNewsHeadline(id, req.body);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News updated successfully',
    data: result,
  });
});

export const updateSelfNewsHeadlineHeadlines = catchAsync(async (req, res) => {
  const { ids, ...payload } = req.body;
  const result = await NewsServices.updateSelfNewsHeadlineHeadlines(
    req.user,
    ids,
    payload,
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News updated successfully',
    data: result,
  });
});

export const updateNewsHeadlines = catchAsync(async (req, res) => {
  const { ids, ...payload } = req.body;
  const result = await NewsServices.updateNewsHeadlines(ids, payload);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'All News are updated successfully',
    data: result,
  });
});

export const deleteSelfNewsHeadline = catchAsync(async (req, res) => {
  const { id } = req.params;
  await NewsServices.deleteSelfNewsHeadline(req.user, id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News soft deleted successfully',
    data: null,
  });
});

export const deleteNewsHeadline = catchAsync(async (req, res) => {
  const { id } = req.params;
  await NewsServices.deleteNewsHeadline(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News soft deleted successfully',
    data: null,
  });
});

export const deleteNewsHeadlinePermanent = catchAsync(async (req, res) => {
  const { id } = req.params;
  await NewsServices.deleteNewsHeadlinePermanent(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News permanently deleted successfully',
    data: null,
  });
});

export const deleteSelfNewsHeadlineHeadlines = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await NewsServices.deleteSelfNewsHeadlineHeadlines(
    req.user,
    ids,
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} NewsHeadlines soft deleted successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});

export const deleteNewsHeadlines = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await NewsServices.deleteNewsHeadlines(ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} NewsHeadlines soft deleted successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});

export const deleteNewsHeadlinesPermanent = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await NewsServices.deleteNewsHeadlinesPermanent(ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} News are permanently deleted successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});

export const restoreSelfNewsHeadline = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NewsServices.restoreSelfNewsHeadline(req.user, id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News restored successfully',
    data: result,
  });
});

export const restoreNewsHeadline = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NewsServices.restoreNewsHeadline(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News restored successfully',
    data: result,
  });
});

export const restoreSelfNewsHeadlineHeadlines = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await NewsServices.restoreSelfNewsHeadlineHeadlines(
    req.user,
    ids,
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} News are restored successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});

export const restoreNewsHeadlines = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await NewsServices.restoreNewsHeadlines(ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} News are restored successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});
