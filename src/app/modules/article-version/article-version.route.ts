import { Router } from 'express';
import auth from '../../middlewares/auth.middleware';
import validation from '../../middlewares/validation.middleware';
import { ArticleVersionController } from './article-version.controller';
import { ArticleVersionValidation } from './article-version.validation';

const router = Router();

// Get all versions for a news article
router.get(
  '/news/:newsId',
  auth('super-admin', 'admin', 'editor', 'author'),
  validation(ArticleVersionValidation.getVersionsByNewsIdSchema),
  ArticleVersionController.getVersionsByNewsId,
);

// Get a specific version
router.get(
  '/:versionId',
  auth('super-admin', 'admin', 'editor', 'author'),
  ArticleVersionController.getVersionById,
);

// Compare two versions
router.get(
  '/news/:newsId/compare',
  auth('super-admin', 'admin', 'editor', 'author'),
  validation(ArticleVersionValidation.compareVersionsSchema),
  ArticleVersionController.compareVersions,
);

// Restore a version
router.post(
  '/:versionId/restore',
  auth('super-admin', 'admin', 'editor'),
  validation(ArticleVersionValidation.restoreVersionSchema),
  ArticleVersionController.restoreVersion,
);

// Delete a version
router.delete(
  '/:versionId',
  auth('super-admin', 'admin'),
  ArticleVersionController.deleteVersion,
);

const ArticleVersionRoutes = router;

export default ArticleVersionRoutes;
