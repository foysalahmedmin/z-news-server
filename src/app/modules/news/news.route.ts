import express from 'express';
import httpStatus from 'http-status';
import AppError from '../../builder/AppError';
import auth from '../../middlewares/auth.middleware';
import file from '../../middlewares/file.middleware';
import validation from '../../middlewares/validation.middleware';
import * as NewsControllers from './news.controller';
import { getFileConfigByType } from './news.utils';
import * as NewsValidations from './news.validation';

const router = express.Router();

// GET
router.get('/public', NewsControllers.getPublicBulkNews);
router.get(
  '/self',
  auth('admin', 'editor', 'author', 'contributor'),
  NewsControllers.getSelfBulkNews,
);

router.get(
  '/',
  auth('admin', 'editor', 'author', 'contributor'),
  NewsControllers.getBulkNews,
);

router.get('/:slug/public', NewsControllers.getPublicNews);
router.get(
  '/:id/self',
  auth('admin', 'editor', 'author', 'contributor'),
  validation(NewsValidations.newsOperationValidationSchema),
  NewsControllers.getSelfNews,
);
router.get(
  '/:id',
  auth('admin', 'editor', 'author', 'contributor'),
  validation(NewsValidations.newsOperationValidationSchema),
  NewsControllers.getNews,
);

// PATCH
router.patch(
  '/bulk/self',
  // auth('admin', 'author'),
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
  '/file/:path',
  auth('admin', 'author'),
  NewsControllers.deleteNewsFile,
);

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
  '/file/:type',
  // auth('admin', 'author'),
  (req, res, next) => {
    const { type } = req.params;

    // Validate type parameter
    const validTypes = ['image', 'video', 'audio', 'file'];
    if (!validTypes.includes(type)) {
      return next(new AppError(httpStatus.BAD_REQUEST, 'Invalid upload type'));
    }

    // Configure file upload based on type
    const fileConfig = getFileConfigByType(type);
    const fileMiddleware = file(fileConfig);

    fileMiddleware(req, res, next);
  },
  NewsControllers.uploadNewsFile,
);

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
