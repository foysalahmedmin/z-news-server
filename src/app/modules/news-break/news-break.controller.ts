import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import * as NewsBreakServices from './news-break.service';

export const createNewsBreak = catchAsync(async (req, res) => {
  const result = await NewsBreakServices.createNewsBreak(req.user, req.body);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News-Break created successfully',
    data: result,
  });
});

export const getSelfNewsBreak = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NewsBreakServices.getSelfNewsBreak(req.user, id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News-Break retrieved successfully',
    data: result,
  });
});

export const getNewsBreak = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NewsBreakServices.getNewsBreak(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News-Break retrieved successfully',
    data: result,
  });
});

export const getSelfNewsBreaks = catchAsync(async (req, res) => {
  const result = await NewsBreakServices.getSelfNewsBreaks(req.user, req.query);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'All news-breaks are retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const getNewsBreaks = catchAsync(async (req, res) => {
  const result = await NewsBreakServices.getNewsBreaks(req.query);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'All news-breaks are retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const updateSelfNewsBreak = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NewsBreakServices.updateSelfNewsBreak(
    req.user,
    id,
    req.body,
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News-Break updated successfully',
    data: result,
  });
});

export const updateNewsBreak = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NewsBreakServices.updateNewsBreak(id, req.body);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News-Break updated successfully',
    data: result,
  });
});

export const updateSelfNewsBreaks = catchAsync(async (req, res) => {
  const { ids, ...payload } = req.body;
  const result = await NewsBreakServices.updateSelfNewsBreaks(
    req.user,
    ids,
    payload,
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News-Break updated successfully',
    data: result,
  });
});

export const updateNewsBreaks = catchAsync(async (req, res) => {
  const { ids, ...payload } = req.body;
  const result = await NewsBreakServices.updateNewsBreaks(ids, payload);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'All news-breaks are updated successfully',
    data: result,
  });
});

export const deleteSelfNewsBreak = catchAsync(async (req, res) => {
  const { id } = req.params;
  await NewsBreakServices.deleteSelfNewsBreak(req.user, id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News-Break soft deleted successfully',
    data: null,
  });
});

export const deleteNewsBreak = catchAsync(async (req, res) => {
  const { id } = req.params;
  await NewsBreakServices.deleteNewsBreak(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News-Break soft deleted successfully',
    data: null,
  });
});

export const deleteNewsBreakPermanent = catchAsync(async (req, res) => {
  const { id } = req.params;
  await NewsBreakServices.deleteNewsBreakPermanent(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News-Break permanently deleted successfully',
    data: null,
  });
});

export const deleteSelfNewsBreaks = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await NewsBreakServices.deleteSelfNewsBreaks(req.user, ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} news-breaks are soft deleted successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});

export const deleteNewsBreaks = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await NewsBreakServices.deleteNewsBreaks(ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} news-breaks are soft deleted successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});

export const deleteNewsBreaksPermanent = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await NewsBreakServices.deleteNewsBreaksPermanent(ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} news-breaks are permanently deleted successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});

export const restoreSelfNewsBreak = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NewsBreakServices.restoreSelfNewsBreak(req.user, id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News-Break restored successfully',
    data: result,
  });
});

export const restoreNewsBreak = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NewsBreakServices.restoreNewsBreak(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'News-Break restored successfully',
    data: result,
  });
});

export const restoreSelfNewsBreaks = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await NewsBreakServices.restoreSelfNewsBreaks(req.user, ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} news-breaks are restored successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});

export const restoreNewsBreaks = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await NewsBreakServices.restoreNewsBreaks(ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} news-breaks are restored successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});
