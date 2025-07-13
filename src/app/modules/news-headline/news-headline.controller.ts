import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import * as NewsHeadlineServices from './news-headline.service';

export const createNewsHeadline = catchAsync(async (req, res) => {
  const result = await NewsHeadlineServices.createNewsHeadline(
    req.user,
    req.body,
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News-Headline created successfully',
    data: result,
  });
});

export const getSelfNewsHeadline = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NewsHeadlineServices.getSelfNewsHeadline(req.user, id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News-Headline retrieved successfully',
    data: result,
  });
});

export const getNewsHeadline = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NewsHeadlineServices.getNewsHeadline(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News-Headline retrieved successfully',
    data: result,
  });
});

export const getSelfNewsHeadlines = catchAsync(async (req, res) => {
  const result = await NewsHeadlineServices.getSelfNewsHeadlines(
    req.user,
    req.query,
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'All news-headlines are retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const getNewsHeadlines = catchAsync(async (req, res) => {
  const result = await NewsHeadlineServices.getNewsHeadlines(req.query);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'All news-headlines are retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const updateSelfNewsHeadline = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NewsHeadlineServices.updateSelfNewsHeadline(
    req.user,
    id,
    req.body,
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News-Headline updated successfully',
    data: result,
  });
});

export const updateNewsHeadline = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NewsHeadlineServices.updateNewsHeadline(id, req.body);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News-Headline updated successfully',
    data: result,
  });
});

export const updateSelfNewsHeadlines = catchAsync(async (req, res) => {
  const { ids, ...payload } = req.body;
  const result = await NewsHeadlineServices.updateSelfNewsHeadlines(
    req.user,
    ids,
    payload,
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News-Headline updated successfully',
    data: result,
  });
});

export const updateNewsHeadlines = catchAsync(async (req, res) => {
  const { ids, ...payload } = req.body;
  const result = await NewsHeadlineServices.updateNewsHeadlines(ids, payload);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'All news-headlines are updated successfully',
    data: result,
  });
});

export const deleteSelfNewsHeadline = catchAsync(async (req, res) => {
  const { id } = req.params;
  await NewsHeadlineServices.deleteSelfNewsHeadline(req.user, id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News-Headline soft deleted successfully',
    data: null,
  });
});

export const deleteNewsHeadline = catchAsync(async (req, res) => {
  const { id } = req.params;
  await NewsHeadlineServices.deleteNewsHeadline(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News-Headline soft deleted successfully',
    data: null,
  });
});

export const deleteNewsHeadlinePermanent = catchAsync(async (req, res) => {
  const { id } = req.params;
  await NewsHeadlineServices.deleteNewsHeadlinePermanent(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News-Headline permanently deleted successfully',
    data: null,
  });
});

export const deleteSelfNewsHeadlines = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await NewsHeadlineServices.deleteSelfNewsHeadlines(
    req.user,
    ids,
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} news-headlines are soft deleted successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});

export const deleteNewsHeadlines = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await NewsHeadlineServices.deleteNewsHeadlines(ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} news-headlines are soft deleted successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});

export const deleteNewsHeadlinesPermanent = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await NewsHeadlineServices.deleteNewsHeadlinesPermanent(ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} news-headlines are permanently deleted successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});

export const restoreSelfNewsHeadline = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NewsHeadlineServices.restoreSelfNewsHeadline(
    req.user,
    id,
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News-Headline restored successfully',
    data: result,
  });
});

export const restoreNewsHeadline = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NewsHeadlineServices.restoreNewsHeadline(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News-Headline restored successfully',
    data: result,
  });
});

export const restoreSelfNewsHeadlines = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await NewsHeadlineServices.restoreSelfNewsHeadlines(
    req.user,
    ids,
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} news-headlines are restored successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});

export const restoreNewsHeadlines = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await NewsHeadlineServices.restoreNewsHeadlines(ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} news-headlines are restored successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});
