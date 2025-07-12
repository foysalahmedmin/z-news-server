import express from 'express';
import auth from '../../middlewares/auth.middleware';
import validation from '../../middlewares/validation.middleware';
import * as NewsControllers from './news.controller';
import * as NewsValidations from './news.validation';

const router = express.Router();

// GET
router.get('/self', auth('admin'), NewsControllers.getSelfBulkNews);
router.get('/', auth('admin'), NewsControllers.getBulkNews);

router.get(
  '/:id/self',
  auth('admin', 'author'),
  validation(NewsValidations.newsOperationValidationSchema),
  NewsControllers.getSelfNews,
);

router.get(
  '/:id',
  auth('admin'),
  validation(NewsValidations.newsOperationValidationSchema),
  NewsControllers.getNews,
);

// PATCH
router.patch(
  '/bulk/self',
  auth('admin', 'author'),
  validation(NewsValidations.updateSelfBulkNewsValidationSchema),
  NewsControllers.updateBulkNews,
);

router.patch(
  '/:id/self',
  auth('admin', 'author'),
  validation(NewsValidations.updateSelfNewsValidationSchema),
  NewsControllers.updateSelfNews,
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
  '/bulk/self',
  auth('admin', 'author'),
  validation(NewsValidations.bulkNewsOperationValidationSchema),
  NewsControllers.deleteSelfBulkNews,
);

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
  '/:id/self',
  auth('admin', 'author'),
  validation(NewsValidations.newsOperationValidationSchema),
  NewsControllers.deleteSelfNews,
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
  auth('admin', 'author'),
  validation(NewsValidations.createNewsValidationSchema),
  NewsControllers.createNews,
);

router.post(
  '/bulk/restore/self',
  auth('admin', 'author'),
  validation(NewsValidations.bulkNewsOperationValidationSchema),
  NewsControllers.restoreSelfBulkNews,
);

router.post(
  '/bulk/restore',
  auth('admin'),
  validation(NewsValidations.bulkNewsOperationValidationSchema),
  NewsControllers.restoreBulkNews,
);

router.post(
  '/:id/restore/self',
  auth('admin', 'author'),
  validation(NewsValidations.newsOperationValidationSchema),
  NewsControllers.restoreSelfNews,
);

router.post(
  '/:id/restore',
  auth('admin'),
  validation(NewsValidations.newsOperationValidationSchema),
  NewsControllers.restoreNews,
);

const NewsRoutes = router;

export default NewsRoutes;
