import express from 'express';
import auth from '../../middlewares/auth.middleware';
import validation from '../../middlewares/validation.middleware';
import * as CommentControllers from './comment.controller';
import * as CommentValidations from './comment.validation';

const router = express.Router();

// GET
router.get('/', auth('admin'), CommentControllers.getComments);

router.get(
  '/:id',
  auth('admin'),
  validation(CommentValidations.commentOperationValidationSchema),
  CommentControllers.getComment,
);

// PATCH
router.patch(
  '/bulk',
  auth('admin'),
  validation(CommentValidations.updateCommentsValidationSchema),
  CommentControllers.updateComments,
);

router.patch(
  '/:id',
  auth('admin'),
  validation(CommentValidations.updateCommentValidationSchema),
  CommentControllers.updateComment,
);

// DELETE
router.delete(
  '/bulk/permanent',
  auth('admin'),
  validation(CommentValidations.commentsOperationValidationSchema),
  CommentControllers.deleteCommentsPermanent,
);

router.delete(
  '/bulk',
  auth('admin'),
  validation(CommentValidations.commentsOperationValidationSchema),
  CommentControllers.deleteComments,
);

router.delete(
  '/:id/permanent',
  auth('admin'),
  validation(CommentValidations.commentOperationValidationSchema),
  CommentControllers.deleteCommentPermanent,
);

router.delete(
  '/:id',
  auth('admin'),
  validation(CommentValidations.commentOperationValidationSchema),
  CommentControllers.deleteComment,
);

// POST
router.post(
  '/',
  auth('admin'),
  validation(CommentValidations.createCommentValidationSchema),
  CommentControllers.createComment,
);

router.post(
  '/bulk/restore',
  auth('admin'),
  validation(CommentValidations.commentsOperationValidationSchema),
  CommentControllers.restoreComments,
);

router.post(
  '/:id/restore',
  auth('admin'),
  validation(CommentValidations.commentOperationValidationSchema),
  CommentControllers.restoreComment,
);

const CommentRoutes = router;

export default CommentRoutes;
