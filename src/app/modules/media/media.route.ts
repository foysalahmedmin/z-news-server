import express from 'express';
import * as MediaControllers from './media.controller';

const router = express.Router();

// GET - Fixed syntax for path-to-regexp v8
router.get(
  '/',
  // auth('super-admin', 'admin', 'editor', 'author'),
  MediaControllers.getMedias,
);

const mediaRoutes = router;

export default mediaRoutes;
