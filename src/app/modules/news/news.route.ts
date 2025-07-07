import express from 'express';
import auth from '../../middlewares/auth.middleware';
import validation from '../../middlewares/validation.middleware';
import * as NewsControllers from './news.controller';
import * as NewsValidations from './news.validation';

const router = express.Router();

// GET
router.get('/', auth('admin'), NewsControllers.getBulkNews);

router.get(
  '/:id',
  auth('admin'),
  validation(NewsValidations.newsOperationValidationSchema),
  NewsControllers.getNews,
);

// PATCH
router.patch(
  '/bulk',
  auth('admin', 'editor', 'author', 'contributor'),
  validation(NewsValidations.updateSelfBulkNewsValidationSchema),
  NewsControllers.updateBulkNews,
);

router.patch(
  '/:id',
  auth('admin', 'editor', 'author', 'contributor'),
  validation(NewsValidations.updateSelfNewsValidationSchema),
  NewsControllers.updateNews,
);

router.patch(
  '/bulk',
  auth('admin'),
  validation(NewsValidations.updateBulkNewsValidationSchema),
  NewsControllers.updateBulkNews,
);

router.patch(
  '/:id',
  auth('admin', 'editor'),
  validation(NewsValidations.updateNewsValidationSchema),
  NewsControllers.updateNews,
);

// DELETE
router.delete(
  '/bulk/permanent',
  auth('admin'),
  validation(NewsValidations.bulkNewsOperationValidationSchema),
  NewsControllers.deleteBulkNewsPermanent,
);

router.delete(
  '/bulk',
  auth('admin'),
  validation(NewsValidations.bulkNewsOperationValidationSchema),
  NewsControllers.deleteBulkNews,
);

router.delete(
  '/:id/permanent',
  auth('admin'),
  validation(NewsValidations.newsOperationValidationSchema),
  NewsControllers.deleteNewsPermanent,
);

router.delete(
  '/:id',
  auth('admin'),
  validation(NewsValidations.newsOperationValidationSchema),
  NewsControllers.deleteNews,
);

// POST
router.post(
  '/',
  auth('admin'),
  validation(NewsValidations.createNewsValidationSchema),
  NewsControllers.createNews,
);

router.post(
  '/bulk/restore',
  auth('admin'),
  validation(NewsValidations.bulkNewsOperationValidationSchema),
  NewsControllers.restoreBulkNews,
);

router.post(
  '/:id/restore',
  auth('admin'),
  validation(NewsValidations.newsOperationValidationSchema),
  NewsControllers.restoreNews,
);

const NewsRoutes = router;

export default NewsRoutes;
