import express from 'express';
import auth from '../../middlewares/auth.middleware';
import * as MediaControllers from './media.controller';

const router = express.Router();

// GET
router.get(
  '/:folder(*)',
  auth('super-admin', 'admin', 'editor', 'author'),
  MediaControllers.getMedias,
);

const mediaRoutes = router;

export default mediaRoutes;
