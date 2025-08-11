import express from 'express';
import auth from '../../middlewares/auth.middleware';
import validation from '../../middlewares/validation.middleware';
import * as NewsBreakControllers from './news-break.controller';
import * as NewsBreakValidations from './news-break.validation';

const router = express.Router();

// GET
router.get('/public', NewsBreakControllers.getPublicNewsBreaks);
router.get('/self', auth('admin'), NewsBreakControllers.getSelfNewsBreaks);
router.get('/', auth('admin'), NewsBreakControllers.getNewsBreaks);

router.get(
  '/:id/self',
  auth('admin', 'author'),
  validation(NewsBreakValidations.newsBreakOperationValidationSchema),
  NewsBreakControllers.getSelfNewsBreak,
);

router.get(
  '/:id',
  auth('admin'),
  validation(NewsBreakValidations.newsBreakOperationValidationSchema),
  NewsBreakControllers.getNewsBreak,
);

// PATCH
router.patch(
  '/bulk/self',
  auth('admin', 'author'),
  validation(NewsBreakValidations.updateSelfNewsBreaksValidationSchema),
  NewsBreakControllers.updateSelfNewsBreaks,
);

router.patch(
  '/:id/self',
  auth('admin', 'author'),
  validation(NewsBreakValidations.updateSelfNewsBreakValidationSchema),
  NewsBreakControllers.updateNewsBreak,
);

router.patch(
  '/bulk',
  auth('admin'),
  validation(NewsBreakValidations.updateNewsBreaksValidationSchema),
  NewsBreakControllers.updateNewsBreaks,
);

router.patch(
  '/:id',
  auth('admin', 'editor'),
  validation(NewsBreakValidations.updateNewsBreakValidationSchema),
  NewsBreakControllers.updateNewsBreak,
);

// DELETE
router.delete(
  '/bulk/self',
  auth('admin', 'author'),
  validation(NewsBreakValidations.newsBreaksOperationValidationSchema),
  NewsBreakControllers.deleteSelfNewsBreaks,
);

router.delete(
  '/bulk/permanent',
  auth('admin'),
  validation(NewsBreakValidations.newsBreaksOperationValidationSchema),
  NewsBreakControllers.deleteNewsBreaksPermanent,
);

router.delete(
  '/bulk',
  auth('admin'),
  validation(NewsBreakValidations.newsBreaksOperationValidationSchema),
  NewsBreakControllers.deleteNewsBreaks,
);

router.delete(
  '/:id/self',
  auth('admin', 'author'),
  validation(NewsBreakValidations.newsBreakOperationValidationSchema),
  NewsBreakControllers.deleteSelfNewsBreak,
);

router.delete(
  '/:id/permanent',
  auth('admin'),
  validation(NewsBreakValidations.newsBreakOperationValidationSchema),
  NewsBreakControllers.deleteNewsBreakPermanent,
);

router.delete(
  '/:id',
  auth('admin'),
  validation(NewsBreakValidations.newsBreakOperationValidationSchema),
  NewsBreakControllers.deleteNewsBreak,
);

// POST
router.post(
  '/',
  auth('admin', 'author'),
  validation(NewsBreakValidations.createNewsBreakValidationSchema),
  NewsBreakControllers.createNewsBreak,
);

router.post(
  '/bulk/restore/self',
  auth('admin', 'author'),
  validation(NewsBreakValidations.newsBreaksOperationValidationSchema),
  NewsBreakControllers.restoreSelfNewsBreaks,
);

router.post(
  '/bulk/restore',
  auth('admin'),
  validation(NewsBreakValidations.newsBreaksOperationValidationSchema),
  NewsBreakControllers.restoreNewsBreaks,
);

router.post(
  '/:id/restore/self',
  auth('admin', 'author'),
  validation(NewsBreakValidations.newsBreakOperationValidationSchema),
  NewsBreakControllers.restoreSelfNewsBreak,
);

router.post(
  '/:id/restore',
  auth('admin'),
  validation(NewsBreakValidations.newsBreakOperationValidationSchema),
  NewsBreakControllers.restoreNewsBreak,
);

const NewsBreakRoutes = router;

export default NewsBreakRoutes;
