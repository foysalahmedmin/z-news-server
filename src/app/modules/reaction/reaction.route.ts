import express from 'express';
import auth from '../../middlewares/auth.middleware';
import guest from '../../middlewares/guest.middleware';
import validation from '../../middlewares/validation.middleware';
import * as ReactionControllers from './reaction.controller';
import * as ReactionValidations from './reaction.validation';

const router = express.Router();

// GET
router.get(
  '/self',
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
  ReactionControllers.getSelfReactions,
);
router.get('/', auth('admin'), ReactionControllers.getReactions);

router.get(
  '/news/:news_id/self',
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
  validation(ReactionValidations.newsReactionOperationValidationSchema),
  ReactionControllers.getSelfNewsReaction,
);

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
  validation(ReactionValidations.reactionOperationValidationSchema),
  ReactionControllers.getSelfReaction,
);

router.get(
  '/:id',
  auth('admin'),
  validation(ReactionValidations.reactionOperationValidationSchema),
  ReactionControllers.getReaction,
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
  validation(ReactionValidations.updateSelfReactionsValidationSchema),
  ReactionControllers.updateReactions,
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
  validation(ReactionValidations.updateSelfReactionValidationSchema),
  ReactionControllers.updateReaction,
);

router.patch(
  '/bulk',
  auth('admin'),
  validation(ReactionValidations.updateReactionsValidationSchema),
  ReactionControllers.updateReactions,
);

router.patch(
  '/:id',
  auth('admin', 'editor'),
  validation(ReactionValidations.updateReactionValidationSchema),
  ReactionControllers.updateReaction,
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
  validation(ReactionValidations.reactionOperationValidationSchema),
  ReactionControllers.deleteSelfReactions,
);

router.delete(
  '/bulk/permanent',
  auth('admin'),
  validation(ReactionValidations.reactionOperationValidationSchema),
  ReactionControllers.deleteReactionsPermanent,
);

router.delete(
  '/bulk',
  auth('admin'),
  validation(ReactionValidations.reactionOperationValidationSchema),
  ReactionControllers.deleteReactions,
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
  validation(ReactionValidations.reactionOperationValidationSchema),
  ReactionControllers.deleteSelfReaction,
);

router.delete(
  '/:id/permanent',
  auth('admin'),
  validation(ReactionValidations.reactionOperationValidationSchema),
  ReactionControllers.deleteReactionPermanent,
);

router.delete(
  '/:id',
  auth('admin'),
  validation(ReactionValidations.reactionOperationValidationSchema),
  ReactionControllers.deleteReaction,
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
  validation(ReactionValidations.createReactionValidationSchema),
  ReactionControllers.createReaction,
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
  validation(ReactionValidations.reactionOperationValidationSchema),
  ReactionControllers.restoreSelfReactions,
);

router.post(
  '/bulk/restore',
  auth('admin'),
  validation(ReactionValidations.reactionOperationValidationSchema),
  ReactionControllers.restoreReactions,
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
  validation(ReactionValidations.reactionOperationValidationSchema),
  ReactionControllers.restoreSelfReaction,
);

router.post(
  '/:id/restore',
  auth('admin'),
  validation(ReactionValidations.reactionOperationValidationSchema),
  ReactionControllers.restoreReaction,
);

const ReactionRoutes = router;

export default ReactionRoutes;
