import httpStatus from 'http-status';
import catchAsync from '../../utils/catch-async';
import sendResponse from '../../utils/send-response';
import { EnhancedCommentService } from './comment-enhanced.service';

// ============ THREADING CONTROLLERS ============

// Get threaded comments for news
const getThreadedComments = catchAsync(async (req, res) => {
  const { news_id } = req.params;

  const comments = await EnhancedCommentService.getThreadedComments(news_id);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Threaded comments retrieved successfully',
    data: comments,
  });
});

// Get replies for a comment
const getCommentReplies = catchAsync(async (req, res) => {
  const { comment_id } = req.params;

  const replies = await EnhancedCommentService.getCommentReplies(comment_id);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Comment replies retrieved successfully',
    data: replies,
  });
});

// Create a reply to a comment
const createReply = catchAsync(async (req, res) => {
  const { comment_id } = req.params;
  const userId = req.user?._id;

  const reply = await EnhancedCommentService.createReply(
    userId,
    comment_id,
    req.body,
  );

  sendResponse(res, {
    success: true,
    status: httpStatus.CREATED,
    message: 'Reply created successfully',
    data: reply,
  });
});

// ============ REACTION CONTROLLERS ============

// Add reaction to comment
const addReaction = catchAsync(async (req, res) => {
  const { comment_id } = req.params;
  const userId = req.user?._id;
  const { type } = req.body;

  const comment = await EnhancedCommentService.addReaction(
    comment_id,
    userId,
    type,
  );

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Reaction added successfully',
    data: comment,
  });
});

// Remove reaction from comment
const removeReaction = catchAsync(async (req, res) => {
  const { comment_id } = req.params;
  const userId = req.user?._id;

  const comment = await EnhancedCommentService.removeReaction(
    comment_id,
    userId,
  );

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Reaction removed successfully',
    data: comment,
  });
});

// Get reaction summary
const getReactionSummary = catchAsync(async (req, res) => {
  const { comment_id } = req.params;

  const summary = await EnhancedCommentService.getReactionSummary(comment_id);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Reaction summary retrieved successfully',
    data: summary,
  });
});

// ============ PINNING CONTROLLERS ============

// Pin a comment
const pinComment = catchAsync(async (req, res) => {
  const { comment_id } = req.params;

  const comment = await EnhancedCommentService.pinComment(comment_id);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Comment pinned successfully',
    data: comment,
  });
});

// Unpin a comment
const unpinComment = catchAsync(async (req, res) => {
  const { comment_id } = req.params;

  const comment = await EnhancedCommentService.unpinComment(comment_id);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Comment unpinned successfully',
    data: comment,
  });
});

// ============ MODERATION CONTROLLERS ============

// Flag a comment
const flagComment = catchAsync(async (req, res) => {
  const { comment_id } = req.params;
  const userId = req.user?._id;
  const { reason } = req.body;

  const comment = await EnhancedCommentService.flagComment(
    comment_id,
    userId,
    reason,
  );

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Comment flagged successfully',
    data: comment,
  });
});

// Unflag a comment
const unflagComment = catchAsync(async (req, res) => {
  const { comment_id } = req.params;
  const userId = req.user?._id;

  const comment = await EnhancedCommentService.unflagComment(
    comment_id,
    userId,
  );

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Comment unflagged successfully',
    data: comment,
  });
});

// Moderate a comment
const moderateComment = catchAsync(async (req, res) => {
  const { comment_id } = req.params;
  const moderatorId = req.user?._id;
  const { status, reason } = req.body;

  const comment = await EnhancedCommentService.moderateComment(
    comment_id,
    moderatorId,
    status,
    reason,
  );

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Comment moderated successfully',
    data: comment,
  });
});

// Get flagged comments
const getFlaggedComments = catchAsync(async (req, res) => {
  const minFlags = Number(req.query.min_flags) || 1;

  const comments = await EnhancedCommentService.getFlaggedComments(minFlags);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Flagged comments retrieved successfully',
    data: comments,
  });
});

// ============ EDIT HISTORY CONTROLLERS ============

// Update comment with history
const updateCommentWithHistory = catchAsync(async (req, res) => {
  const { comment_id } = req.params;
  const userId = req.user?._id;
  const { content } = req.body;

  const comment = await EnhancedCommentService.updateCommentWithHistory(
    comment_id,
    userId,
    content,
  );

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Comment updated successfully',
    data: comment,
  });
});

// Get edit history
const getEditHistory = catchAsync(async (req, res) => {
  const { comment_id } = req.params;

  const history = await EnhancedCommentService.getEditHistory(comment_id);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Edit history retrieved successfully',
    data: history,
  });
});

export const EnhancedCommentController = {
  // Threading
  getThreadedComments,
  getCommentReplies,
  createReply,

  // Reactions
  addReaction,
  removeReaction,
  getReactionSummary,

  // Pinning
  pinComment,
  unpinComment,

  // Moderation
  flagComment,
  unflagComment,
  moderateComment,
  getFlaggedComments,

  // Edit History
  updateCommentWithHistory,
  getEditHistory,
};
