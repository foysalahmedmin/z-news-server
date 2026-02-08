import { Router } from 'express';
import auth from '../../middlewares/auth.middleware';
import validation from '../../middlewares/validation.middleware';
import { EnhancedCommentController } from './comment-enhanced.controller';
import { EnhancedCommentValidation } from './comment-enhanced.validation';

const router = Router();

// ============ THREADING ROUTES ============

// Get threaded comments for news article
router.get(
  '/news/:news_id/threaded',
  validation(EnhancedCommentValidation.getThreadedCommentsSchema),
  EnhancedCommentController.getThreadedComments,
);

// Get replies for a comment
router.get(
  '/:comment_id/replies',
  validation(EnhancedCommentValidation.getCommentRepliesSchema),
  EnhancedCommentController.getCommentReplies,
);

// Create a reply to a comment
router.post(
  '/:comment_id/reply',
  auth(),
  validation(EnhancedCommentValidation.createReplySchema),
  EnhancedCommentController.createReply,
);

// ============ REACTION ROUTES ============

// Add reaction to comment
router.post(
  '/:comment_id/reaction',
  auth(),
  validation(EnhancedCommentValidation.addReactionSchema),
  EnhancedCommentController.addReaction,
);

// Remove reaction from comment
router.delete(
  '/:comment_id/reaction',
  auth(),
  validation(EnhancedCommentValidation.removeReactionSchema),
  EnhancedCommentController.removeReaction,
);

// Get reaction summary
router.get(
  '/:comment_id/reactions',
  EnhancedCommentController.getReactionSummary,
);

// ============ PINNING ROUTES ============

// Pin a comment (Editor/Admin only)
router.patch(
  '/:comment_id/pin',
  auth('super-admin', 'admin', 'editor'),
  validation(EnhancedCommentValidation.pinCommentSchema),
  EnhancedCommentController.pinComment,
);

// Unpin a comment (Editor/Admin only)
router.patch(
  '/:comment_id/unpin',
  auth('super-admin', 'admin', 'editor'),
  validation(EnhancedCommentValidation.unpinCommentSchema),
  EnhancedCommentController.unpinComment,
);

// ============ MODERATION ROUTES ============

// Flag a comment
router.post(
  '/:comment_id/flag',
  auth(),
  validation(EnhancedCommentValidation.flagCommentSchema),
  EnhancedCommentController.flagComment,
);

// Unflag a comment
router.delete(
  '/:comment_id/flag',
  auth(),
  validation(EnhancedCommentValidation.unflagCommentSchema),
  EnhancedCommentController.unflagComment,
);

// Moderate a comment (Admin only)
router.patch(
  '/:comment_id/moderate',
  auth('super-admin', 'admin'),
  validation(EnhancedCommentValidation.moderateCommentSchema),
  EnhancedCommentController.moderateComment,
);

// Get flagged comments (Admin only)
router.get(
  '/flagged/list',
  auth('super-admin', 'admin'),
  validation(EnhancedCommentValidation.getFlaggedCommentsSchema),
  EnhancedCommentController.getFlaggedComments,
);

// ============ EDIT HISTORY ROUTES ============

// Update comment with history tracking
router.patch(
  '/:comment_id/edit',
  auth(),
  validation(EnhancedCommentValidation.updateCommentWithHistorySchema),
  EnhancedCommentController.updateCommentWithHistory,
);

// Get edit history
router.get(
  '/:comment_id/history',
  validation(EnhancedCommentValidation.getEditHistorySchema),
  EnhancedCommentController.getEditHistory,
);

export const EnhancedCommentRoutes = router;
