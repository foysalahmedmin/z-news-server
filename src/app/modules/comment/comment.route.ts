import express from 'express';
import auth from '../../middlewares/auth.middleware';
import guest from '../../middlewares/guest.middleware';
import validation from '../../middlewares/validation.middleware';
import * as CommentControllers from './comment.controller';
import * as CommentValidations from './comment.validation';

const router = express.Router();

// GET
router.get(
  '/self',
  guest('optional'),
  auth('admin'),
  CommentControllers.getSelfComments,
);
router.get('/', auth('admin'), CommentControllers.getComments);

router.get(
  '/:id/self',
  guest('optional'),
  auth(
    'admin',
    'editor',
    'author',
    'contributor',
    'subscriber',
    'user',
    'guest',
  ),
  validation(CommentValidations.commentOperationValidationSchema),
  CommentControllers.getSelfComment,
);

router.get(
  '/:id',
  auth('admin'),
  validation(CommentValidations.commentOperationValidationSchema),
  CommentControllers.getComment,
);

// PATCH
router.patch(
  '/bulk/self',
  guest('optional'),
  auth(
    'admin',
    'editor',
    'author',
    'contributor',
    'subscriber',
    'user',
    'guest',
  ),
  validation(CommentValidations.updateSelfCommentsValidationSchema),
  CommentControllers.updateComments,
);

router.patch(
  '/:id/self',
  guest('optional'),
  auth(
    'admin',
    'editor',
    'author',
    'contributor',
    'subscriber',
    'user',
    'guest',
  ),
  validation(CommentValidations.updateSelfCommentValidationSchema),
  CommentControllers.updateComment,
);

router.patch(
  '/bulk',
  auth('admin'),
  validation(CommentValidations.updateCommentsValidationSchema),
  CommentControllers.updateComments,
);

router.patch(
  '/:id',
  auth('admin', 'editor'),
  validation(CommentValidations.updateCommentValidationSchema),
  CommentControllers.updateComment,
);

// DELETE
router.delete(
  '/bulk/self',
  guest('optional'),
  auth(
    'admin',
    'editor',
    'author',
    'contributor',
    'subscriber',
    'user',
    'guest',
  ),
  validation(CommentValidations.commentOperationValidationSchema),
  CommentControllers.deleteSelfComments,
);

router.delete(
  '/bulk/permanent',
  auth('admin'),
  validation(CommentValidations.commentOperationValidationSchema),
  CommentControllers.deleteCommentsPermanent,
);

router.delete(
  '/bulk',
  auth('admin'),
  validation(CommentValidations.commentOperationValidationSchema),
  CommentControllers.deleteComments,
);

router.delete(
  '/:id/self',
  guest('optional'),
  auth(
    'admin',
    'editor',
    'author',
    'contributor',
    'subscriber',
    'user',
    'guest',
  ),
  validation(CommentValidations.commentOperationValidationSchema),
  CommentControllers.deleteSelfComment,
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
  guest('optional'),
  auth(
    'admin',
    'editor',
    'author',
    'contributor',
    'subscriber',
    'user',
    'guest',
  ),
  validation(CommentValidations.createCommentValidationSchema),
  CommentControllers.createComment,
);

router.post(
  '/bulk/restore/self',
  guest('optional'),
  auth(
    'admin',
    'editor',
    'author',
    'contributor',
    'subscriber',
    'user',
    'guest',
  ),
  validation(CommentValidations.commentOperationValidationSchema),
  CommentControllers.restoreSelfComments,
);

router.post(
  '/bulk/restore',
  auth('admin'),
  validation(CommentValidations.commentOperationValidationSchema),
  CommentControllers.restoreComments,
);

router.post(
  '/:id/restore/self',
  guest('optional'),
  auth(
    'admin',
    'editor',
    'author',
    'contributor',
    'subscriber',
    'user',
    'guest',
  ),
  validation(CommentValidations.commentOperationValidationSchema),
  CommentControllers.restoreSelfComment,
);

router.post(
  '/:id/restore',
  auth('admin'),
  validation(CommentValidations.commentOperationValidationSchema),
  CommentControllers.restoreComment,
);

const CommentRoutes = router;

export default CommentRoutes;
