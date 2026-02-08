import httpStatus from 'http-status';
import AppError from '../../builder/app-error';
import { invalidateCacheByPattern } from '../../utils/cache.utils';
import { Reaction } from '../reaction/reaction.model';
import { UserProfile } from '../user-profile/user-profile.model';
import { Comment } from './comment.model';

const CACHE_PREFIX = 'comment';

// ============ THREADING SERVICES ============

// Get threaded comments for a news article
export const getThreadedComments = async (newsId: string) => {
  const topLevelComments = await Comment.getThreadedComments(newsId);

  // For each top-level comment, fetch its replies
  const commentsWithReplies = await Promise.all(
    topLevelComments!.map(async (comment: any) => {
      const replies = await Comment.getCommentReplies(comment._id.toString());
      return {
        ...comment.toObject(),
        replies,
        reply_count: replies?.length || 0,
      };
    }),
  );

  return commentsWithReplies;
};

// Get replies for a specific comment
export const getCommentReplies = async (comment_id: string) => {
  const comment = await Comment.findById(comment_id);

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  return await Comment.getCommentReplies(comment_id);
};

// Create a reply to a comment
export const createReply = async (
  userId: string,
  parentcomment_id: string,
  payload: {
    content: string;
    name: string;
    email: string;
    reply_to_user?: string;
  },
) => {
  const parentComment = await Comment.findById(parentcomment_id);

  if (!parentComment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Parent comment not found');
  }

  // Check thread level limit
  if (parentComment.thread_level >= 5) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Maximum thread depth reached (5 levels)',
    );
  }

  const reply = await Comment.create({
    news: parentComment.news,
    parent_comment: parentcomment_id,
    reply_to_user: payload.reply_to_user || parentComment.user,
    thread_level: parentComment.thread_level + 1,
    user: userId,
    name: payload.name,
    email: payload.email,
    content: payload.content,
  });

  // Update user activity
  await UserProfile.incrementActivityStat(userId, 'total_comments');

  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);

  return await Comment.findById(reply._id)
    .populate('user', 'name email image')
    .populate('reply_to_user', 'name')
    .populate('parent_comment', 'content');
};

// ============ REACTION SERVICES ============

// Add reaction to comment
export const addReaction = async (
  comment_id: string,
  userId: string,
  reactionType: 'like' | 'dislike',
) => {
  const comment = await Comment.findById(comment_id);

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  // Check if user already reacted
  const existingReaction = await Reaction.findOne({
    user: userId,
    comment: comment_id,
  });

  if (existingReaction) {
    // Update existing reaction
    existingReaction.type = reactionType;
    await existingReaction.save();
  } else {
    // Add new reaction
    // We need the news ID from the comment to maintain the link
    await Reaction.create({
      news: comment.news,
      comment: comment_id,
      user: userId,
      type: reactionType,
      status: 'approved',
    });
  }

  // Make sure to invalidate cache
  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);

  return await Comment.findById(comment._id)
    .populate('user', 'name email image')
    .populate('reactions', 'user type created_at');
};

// Remove reaction from comment
export const removeReaction = async (comment_id: string, userId: string) => {
  const comment = await Comment.findById(comment_id);

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  await Reaction.findOneAndDelete({
    comment: comment_id,
    user: userId,
  });

  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);

  return await Comment.findById(comment._id)
    .populate('user', 'name email image')
    .populate('reactions', 'user type created_at');
};

// Get reaction summary for a comment
export const getReactionSummary = async (comment_id: string) => {
  const comment = await Comment.findById(comment_id);

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  return await Comment.findById(comment_id)
    .populate('reactions')
    .then((c) => c?.reaction_counts);
};

// ============ MENTION SERVICES ============

// Extract mentions from content
export const extractMentions = (content: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }

  return mentions;
};

// Process mentions in comment
export const processMentions = async (
  commentId: string,
  content: string,
  userIds: string[],
) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  // Extract mention positions
  const mentionRegex = /@(\w+)/g;
  const mentions: Array<{ user: string; position: number }> = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    const position = match.index;

    // Find user ID for this user (you'll need to implement user lookup)
    const userId = userIds.find((id) => id); // Simplified
    if (userId) {
      mentions.push({
        user: userId,
        position,
      });
    }
  }

  comment.mentions = mentions as any;
  await comment.save();

  return comment;
};

// ============ PINNING SERVICES ============

// Pin a comment (Editor/Admin only)
export const pinComment = async (comment_id: string) => {
  const comment = await Comment.findById(comment_id);

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  comment.is_pinned = true;
  await comment.save();

  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);

  return await Comment.findById(comment._id).populate(
    'user',
    'name email image',
  );
};

// Unpin a comment
export const unpinComment = async (comment_id: string) => {
  const comment = await Comment.findById(comment_id);

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  comment.is_pinned = false;
  await comment.save();

  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);

  return await Comment.findById(comment._id).populate(
    'user',
    'name email image',
  );
};

// ============ MODERATION SERVICES ============

// Flag a comment
export const flagComment = async (
  comment_id: string,
  userId: string,
  _reason?: string,
) => {
  const comment = await Comment.findById(comment_id);

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  // Check if user already flagged
  const alreadyFlagged = comment.flagged_by.some(
    (id: any) => id.toString() === userId,
  );

  if (alreadyFlagged) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have already flagged this comment',
    );
  }

  comment.flagged_by.push(userId as any);
  comment.flagged_count += 1;

  // Auto-change status to flagged if threshold reached
  if (comment.flagged_count >= 5) {
    comment.status = 'flagged';
  }

  await comment.save();

  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);

  return comment;
};

// Unflag a comment (remove user's flag)
export const unflagComment = async (comment_id: string, userId: string) => {
  const comment = await Comment.findById(comment_id);

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  comment.flagged_by = comment.flagged_by.filter(
    (id: any) => id.toString() !== userId,
  );
  comment.flagged_count = Math.max(0, comment.flagged_count - 1);

  await comment.save();

  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);

  return comment;
};

// Moderate a comment (Admin only)
export const moderateComment = async (
  comment_id: string,
  moderatorId: string,
  status: 'approved' | 'rejected',
  reason?: string,
) => {
  const comment = await Comment.findById(comment_id);

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  comment.status = status;
  comment.moderated_by = moderatorId as any;
  comment.moderated_at = new Date();
  comment.moderation_reason = reason;

  // Clear flags if approved
  if (status === 'approved') {
    comment.flagged_by = [];
    comment.flagged_count = 0;
  }

  await comment.save();

  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);

  return await Comment.findById(comment._id)
    .populate('user', 'name email image')
    .populate('moderated_by', 'name email');
};

// Get flagged comments
export const getFlaggedComments = async (minFlags: number = 1) => {
  return await Comment.find({
    flagged_count: { $gte: minFlags },
  })
    .sort({ flagged_count: -1, created_at: -1 })
    .populate('user', 'name email image')
    .populate('news', 'title slug')
    .populate('flagged_by', 'name email');
};

// ============ EDIT HISTORY SERVICES ============

// Update comment with history tracking
export const updateCommentWithHistory = async (
  comment_id: string,
  userId: string,
  newContent: string,
) => {
  const comment = await Comment.findById(comment_id);

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  // Check ownership
  if (comment.user?.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can only edit your own comments',
    );
  }

  // Save to edit history
  if (!comment.edit_history) {
    comment.edit_history = [];
  }

  comment.edit_history.push({
    content: comment.content,
    edited_at: new Date(),
  });

  // Update content
  comment.content = newContent;
  comment.is_edited = true;
  comment.edited_at = new Date();

  await comment.save();

  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);

  return await Comment.findById(comment._id).populate(
    'user',
    'name email image',
  );
};

// Get edit history
export const getEditHistory = async (comment_id: string) => {
  const comment = await Comment.findById(comment_id);

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  return {
    current_content: comment.content,
    is_edited: comment.is_edited,
    edited_at: comment.edited_at,
    edit_history: comment.edit_history || [],
  };
};

export const EnhancedCommentService = {
  // Threading
  getThreadedComments,
  getCommentReplies,
  createReply,

  // Reactions
  addReaction,
  removeReaction,
  getReactionSummary,

  // Mentions
  extractMentions,
  processMentions,

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
