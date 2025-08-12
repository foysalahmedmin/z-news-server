import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import * as ReactionServices from './reaction.service';

export const createReaction = catchAsync(async (req, res) => {
  const result = await ReactionServices.createReaction(
    req.user,
    req.guest,
    req.body,
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Reaction created successfully',
    data: result,
  });
});

export const getSelfNewsReaction = catchAsync(async (req, res) => {
  const { news_id } = req.params;
  const { data, meta } = await ReactionServices.getSelfNewsReaction(
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

export const getSelfReaction = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ReactionServices.getSelfReaction(
    req.user,
    req.guest,
    id,
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Reaction retrieved successfully',
    data: result,
  });
});

export const getReaction = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ReactionServices.getReaction(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Reaction retrieved successfully',
    data: result,
  });
});

export const getSelfReactions = catchAsync(async (req, res) => {
  const result = await ReactionServices.getSelfReactions(
    req.user,
    req.guest,
    req.query,
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Reactions retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const getReactions = catchAsync(async (req, res) => {
  const result = await ReactionServices.getReactions(req.query);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Reactions retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const updateSelfReaction = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ReactionServices.updateSelfReaction(
    req.user,
    req.guest,
    id,
    req.body,
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Reaction updated successfully',
    data: result,
  });
});

export const updateReaction = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ReactionServices.updateReaction(id, req.body);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Reaction updated successfully',
    data: result,
  });
});

export const updateSelfReactions = catchAsync(async (req, res) => {
  const { ids, ...payload } = req.body;
  const result = await ReactionServices.updateSelfReactions(
    req.user,
    req.guest,
    ids,
    payload,
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Reactions updated successfully',
    data: result,
  });
});

export const updateReactions = catchAsync(async (req, res) => {
  const { ids, ...payload } = req.body;
  const result = await ReactionServices.updateReactions(ids, payload);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Reactions updated successfully',
    data: result,
  });
});

export const deleteSelfReaction = catchAsync(async (req, res) => {
  const { id } = req.params;
  await ReactionServices.deleteSelfReaction(req.user, req.guest, id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Reaction soft deleted successfully',
    data: null,
  });
});

export const deleteReaction = catchAsync(async (req, res) => {
  const { id } = req.params;
  await ReactionServices.deleteReaction(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Reaction soft deleted successfully',
    data: null,
  });
});

export const deleteSelfReactions = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await ReactionServices.deleteSelfReactions(
    req.user,
    req.guest,
    ids,
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} Reactions soft deleted successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});

export const deleteReactions = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await ReactionServices.deleteReactions(ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} Reactions soft deleted successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});
