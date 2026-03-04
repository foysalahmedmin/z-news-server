import httpStatus from 'http-status';
import { Types } from 'mongoose';
import AppError from '../../builder/app-error';
import { invalidateCacheByPattern } from '../../utils/cache.utils';
import * as ReactionRepository from '../reaction/reaction.repository';
import * as UserProfileRepository from '../user-profile/user-profile.repository';
import * as UserRepository from '../user/user.repository';
import * as CommentRepository from './comment.repository';
import { TCommentDocument } from './comment.type';

const CACHE_PREFIX = 'comment';

// ============ THREADING SERVICES ============

// Get threaded comments for a news article
export const getThreadedComments = async (newsId: string) => {
  const topLevelComments = await CommentRepository.getThreadedComments(newsId);

  // For each top-level comment, fetch its replies
  const commentsWithReplies = await Promise.all(
    topLevelComments.map(async (comment) => {
      const replies = await CommentRepository.getCommentReplies(
        comment._id.toString(),
      );
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
  const comment = await CommentRepository.findById(comment_id);

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  return await CommentRepository.getCommentReplies(comment_id);
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
  const parentComment = await CommentRepository.findById(parentcomment_id);

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

  const reply = await CommentRepository.create({
    news: parentComment.news,
    parent_comment: new Types.ObjectId(parentcomment_id),
    reply_to_user: payload.reply_to_user
      ? new Types.ObjectId(payload.reply_to_user)
      : parentComment.user,
    thread_level: parentComment.thread_level + 1,
    user: new Types.ObjectId(userId),
    name: payload.name,
    email: payload.email,
    content: payload.content,
  });

  // Update user activity and reputation
  await UserProfileRepository.incrementActivityStat(userId, 'total_comments');
  await UserProfileRepository.incrementActivityStat(
    userId,
    'reputation_score',
    5,
  ); // 5 points for a reply

  // Process mentions
  const mentionedUsernames = extractMentions(payload.content);
  if (mentionedUsernames.length > 0) {
    const mentionedUsers = await UserRepository.findMany({
      name: { $in: mentionedUsernames },
    });
    if (mentionedUsers.length > 0) {
      await processMentions(
        reply._id.toString(),
        payload.content,
        mentionedUsers.map((u: { _id?: { toString: () => string } }) =>
          u._id!.toString(),
        ),
      );
    }
  }

  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);

  return await CommentRepository.findByIdLean(reply._id.toString(), [
    { path: 'user', select: 'name email image' },
    { path: 'reply_to_user', select: 'name' },
    { path: 'parent_comment', select: 'content' },
  ]);
};

// ============ REACTION SERVICES ============

// Add reaction to comment
export const addReaction = async (
  comment_id: string,
  userId: string,
  reactionType: 'like' | 'dislike' | 'insightful' | 'funny' | 'disagree',
) => {
  const comment = await CommentRepository.findById(comment_id);

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  // Check if user already reacted
  const existingReaction = await ReactionRepository.findOne({
    user: userId,
    comment: comment_id,
  });

  if (existingReaction) {
    // Update existing reaction
    await ReactionRepository.updateById(existingReaction._id.toString(), {
      type: reactionType,
    });
  } else {
    // Add new reaction
    // We need the news ID from the comment to maintain the link
    await ReactionRepository.create({
      news: comment.news,
      comment: new Types.ObjectId(comment_id),
      user: new Types.ObjectId(userId),
      type: reactionType,
      status: 'approved',
    });

    // Update user activity and reputation
    await Promise.all([
      UserProfileRepository.incrementActivityStat(userId, 'total_reactions'),
      UserProfileRepository.incrementActivityStat(
        userId,
        'reputation_score',
        1,
      ), // 1 point for a reaction
    ]).catch((err) =>
      // eslint-disable-next-line no-console
      console.error('Error updating profile stats:', err),
    );
  }

  // Make sure to invalidate cache
  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);

  return await CommentRepository.findByIdLean(comment._id.toString(), [
    { path: 'user', select: 'name email image' },
    { path: 'reactions', select: 'user type created_at' },
  ]);
};

// Remove reaction from comment
export const removeReaction = async (comment_id: string, userId: string) => {
  const comment = await CommentRepository.findById(comment_id);

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  await ReactionRepository.findOneAndDelete({
    comment: comment_id,
    user: userId,
  });

  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);

  return await CommentRepository.findByIdLean(comment._id.toString(), [
    { path: 'user', select: 'name email image' },
    { path: 'reactions', select: 'user type created_at' },
  ]);
};

// Get reaction summary for a comment
export const getReactionSummary = async (comment_id: string) => {
  const comment = await CommentRepository.findById(comment_id);

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  // Note: reaction_counts is a virtual. findById returns the document which has virtuals.
  return (comment as TCommentDocument).reaction_counts;
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
  const comment = await CommentRepository.findById(commentId);

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

  comment.mentions = mentions as unknown as typeof comment.mentions;
  await comment.save();

  return comment;
};

// ============ PINNING SERVICES ============

// Pin a comment (Editor/Admin only)
export const pinComment = async (comment_id: string) => {
  const comment = await CommentRepository.findById(comment_id);

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  comment.is_pinned = true;
  await comment.save();

  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);

  return await CommentRepository.findByIdLean(comment._id.toString(), [
    { path: 'user', select: 'name email image' },
  ]);
};

// Unpin a comment
export const unpinComment = async (comment_id: string) => {
  const comment = await CommentRepository.findById(comment_id);

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  comment.is_pinned = false;
  await comment.save();

  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);

  return await CommentRepository.findByIdLean(comment._id.toString(), [
    { path: 'user', select: 'name email image' },
  ]);
};

// ============ MODERATION SERVICES ============

// Flag a comment
export const flagComment = async (
  comment_id: string,
  userId: string,
  _reason?: string,
) => {
  const comment = await CommentRepository.findById(comment_id);

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  // Check if user already flagged
  const alreadyFlagged = comment.flagged_by.some(
    (id) => id.toString() === userId,
  );

  if (alreadyFlagged) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have already flagged this comment',
    );
  }

  comment.flagged_by.push(userId as unknown as (typeof comment.flagged_by)[0]);
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
  const comment = await CommentRepository.findById(comment_id);

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  comment.flagged_by = comment.flagged_by.filter(
    (id) => id.toString() !== userId,
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
  const comment = await CommentRepository.findById(comment_id);

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  comment.status = status;
  comment.moderated_by = moderatorId as unknown as typeof comment.moderated_by;
  comment.moderated_at = new Date();
  comment.moderation_reason = reason;

  // Clear flags if approved
  if (status === 'approved') {
    comment.flagged_by = [];
    comment.flagged_count = 0;
  }

  await comment.save();

  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);

  return await CommentRepository.findByIdLean(comment._id.toString(), [
    { path: 'user', select: 'name email image' },
    { path: 'moderated_by', select: 'name email' },
  ]);
};

// Get flagged comments
export const getFlaggedComments = async (minFlags: number = 1) => {
  return await CommentRepository.findManyLean(
    { flagged_count: { $gte: minFlags } },
    [
      { path: 'user', select: 'name email image' },
      { path: 'news', select: 'title slug' },
      { path: 'flagged_by', select: 'name email' },
    ],
  );
};

// ============ EDIT HISTORY SERVICES ============

// Update comment with history tracking
export const updateCommentWithHistory = async (
  comment_id: string,
  userId: string,
  newContent: string,
) => {
  const comment = await CommentRepository.findById(comment_id);

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

  return await CommentRepository.findByIdLean(comment._id.toString(), [
    { path: 'user', select: 'name email image' },
  ]);
};

// Get edit history
export const getEditHistory = async (comment_id: string) => {
  const comment = await CommentRepository.findByIdLean(comment_id);

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
