import express from 'express';
import auth from '../../middlewares/auth.middleware';
import validation from '../../middlewares/validation.middleware';
import * as NewsControllers from './news-headline.controller';
import * as NewsValidations from './news-headline.validation';

const router = express.Router();

// GET
router.get('/self', auth('admin'), NewsControllers.getSelfNewsHeadlines);
router.get('/', auth('admin'), NewsControllers.getNewsHeadlines);

router.get(
  '/:id/self',
  auth('admin', 'author'),
  validation(NewsValidations.newsHeadlineOperationValidationSchema),
  NewsControllers.getSelfNewsHeadline,
);

router.get(
  '/:id',
  auth('admin'),
  validation(NewsValidations.newsHeadlineOperationValidationSchema),
  NewsControllers.getNewsHeadline,
);

// PATCH
router.patch(
  '/bulk/self',
  auth('admin', 'author'),
  validation(NewsValidations.updateSelfNewsHeadlinesValidationSchema),
  NewsControllers.updateSelfNewsHeadlines,
);

router.patch(
  '/:id/self',
  auth('admin', 'author'),
  validation(NewsValidations.updateSelfNewsHeadlineValidationSchema),
  NewsControllers.updateNewsHeadline,
);

router.patch(
  '/bulk',
  auth('admin'),
  validation(NewsValidations.updateNewsHeadlinesValidationSchema),
  NewsControllers.updateNewsHeadlines,
);

router.patch(
  '/:id',
  auth('admin', 'editor'),
  validation(NewsValidations.updateNewsHeadlineValidationSchema),
  NewsControllers.updateNewsHeadline,
);

// DELETE
router.delete(
  '/bulk/self',
  auth('admin', 'author'),
  validation(NewsValidations.newsHeadlinesOperationValidationSchema),
  NewsControllers.deleteSelfNewsHeadlines,
);

router.delete(
  '/bulk/permanent',
  auth('admin'),
  validation(NewsValidations.newsHeadlinesOperationValidationSchema),
  NewsControllers.deleteNewsHeadlinesPermanent,
);

router.delete(
  '/bulk',
  auth('admin'),
  validation(NewsValidations.newsHeadlinesOperationValidationSchema),
  NewsControllers.deleteNewsHeadlines,
);

router.delete(
  '/:id/self',
  auth('admin', 'author'),
  validation(NewsValidations.newsHeadlineOperationValidationSchema),
  NewsControllers.deleteSelfNewsHeadline,
);

router.delete(
  '/:id/permanent',
  auth('admin'),
  validation(NewsValidations.newsHeadlineOperationValidationSchema),
  NewsControllers.deleteNewsHeadlinePermanent,
);

router.delete(
  '/:id',
  auth('admin'),
  validation(NewsValidations.newsHeadlineOperationValidationSchema),
  NewsControllers.deleteNewsHeadline,
);

// POST
router.post(
  '/',
  auth('admin', 'author'),
  validation(NewsValidations.createNewsHeadlineValidationSchema),
  NewsControllers.createNewsHeadline,
);

router.post(
  '/bulk/restore/self',
  auth('admin', 'author'),
  validation(NewsValidations.newsHeadlinesOperationValidationSchema),
  NewsControllers.restoreSelfNewsHeadlines,
);

router.post(
  '/bulk/restore',
  auth('admin'),
  validation(NewsValidations.newsHeadlinesOperationValidationSchema),
  NewsControllers.restoreNewsHeadlines,
);

router.post(
  '/:id/restore/self',
  auth('admin', 'author'),
  validation(NewsValidations.newsHeadlineOperationValidationSchema),
  NewsControllers.restoreSelfNewsHeadline,
);

router.post(
  '/:id/restore',
  auth('admin'),
  validation(NewsValidations.newsHeadlineOperationValidationSchema),
  NewsControllers.restoreNewsHeadline,
);

const NewsHeadlineRoutes = router;

export default NewsHeadlineRoutes;
