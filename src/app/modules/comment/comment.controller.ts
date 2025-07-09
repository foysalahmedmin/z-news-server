import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import * as CommentServices from './comment.service';

export const createComment = catchAsync(async (req, res) => {
  const result = await CommentServices.createComment(
    req.user,
    req.guest,
    req.body,
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Comment created successfully',
    data: result,
  });
});

export const getSelfComment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CommentServices.getSelfComment(req.user, req.guest, id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Comment retrieved successfully',
    data: result,
  });
});

export const getComment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CommentServices.getComment(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Comment retrieved successfully',
    data: result,
  });
});

export const getComments = catchAsync(async (req, res) => {
  const result = await CommentServices.getComments(req.query);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Comments retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const updateSelfComment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CommentServices.updateSelfComment(
    req.user,
    req.guest,
    id,
    req.body,
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Comment updated successfully',
    data: result,
  });
});

export const updateComment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CommentServices.updateComment(id, req.body);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Comment updated successfully',
    data: result,
  });
});

export const updateComments = catchAsync(async (req, res) => {
  const { ids, ...payload } = req.body;
  const result = await CommentServices.updateComments(ids, payload);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Comments updated successfully',
    data: result,
  });
});

export const deleteComment = catchAsync(async (req, res) => {
  const { id } = req.params;
  await CommentServices.deleteComment(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Comment soft deleted successfully',
    data: null,
  });
});

export const deleteCommentPermanent = catchAsync(async (req, res) => {
  const { id } = req.params;
  await CommentServices.deleteCommentPermanent(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Comment permanently deleted successfully',
    data: null,
  });
});

export const deleteComments = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await CommentServices.deleteComments(ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} comments soft deleted successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});

export const deleteCommentsPermanent = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await CommentServices.deleteCommentsPermanent(ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} comments permanently deleted successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});

export const restoreComment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CommentServices.restoreComment(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Comment restored successfully',
    data: result,
  });
});

export const restoreComments = catchAsync(async (req, res) => {
  const { ids } = req.body;
  const result = await CommentServices.restoreComments(ids);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: `${result.count} comments restored successfully`,
    data: {
      not_found_ids: result.not_found_ids,
    },
  });
});
