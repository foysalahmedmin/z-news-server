import express from 'express';
import auth from '../../middlewares/auth.middleware';
import validation from '../../middlewares/validation.middleware';
import * as MediaControllers from './media.controller';
import * as MediaValidations from './media.validator';

const router = express.Router();

router.get('/', MediaControllers.getBulkMedia);

router.get('/:id', MediaControllers.getMedia);

router.post(
  '/',
  auth('super-admin', 'admin', 'editor', 'author'),
  validation(MediaValidations.createMediaValidationSchema),
  MediaControllers.createMedia,
);

router.patch(
  '/:id',
  auth('super-admin', 'admin', 'editor'),
  validation(MediaValidations.updateMediaValidationSchema),
  MediaControllers.updateMedia,
);

router.delete(
  '/:id',
  auth('super-admin', 'admin'),
  validation(MediaValidations.mediaOperationSchema),
  MediaControllers.deleteMedia,
);

const mediaRoutes = router;

export default mediaRoutes;
