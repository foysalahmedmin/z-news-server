import express from 'express';
import auth from '../../middlewares/auth.middleware';
import guest from '../../middlewares/guest.middleware';
import validation from '../../middlewares/validation.middleware';
import * as ViewControllers from './view.controller';
import * as ViewValidations from './view.validation';

const router = express.Router();

// GET
router.get(
  '/self',
  guest('optional'),
  auth('admin'),
  ViewControllers.getSelfViews,
);
router.get('/', auth('admin'), ViewControllers.getViews);

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
  validation(ViewValidations.viewOperationValidationSchema),
  ViewControllers.getSelfView,
);

router.get(
  '/:id',
  auth('admin'),
  validation(ViewValidations.viewOperationValidationSchema),
  ViewControllers.getView,
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
  validation(ViewValidations.viewOperationValidationSchema),
  ViewControllers.deleteSelfViews,
);

router.delete(
  '/bulk',
  auth('admin'),
  validation(ViewValidations.viewOperationValidationSchema),
  ViewControllers.deleteViews,
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
  validation(ViewValidations.viewOperationValidationSchema),
  ViewControllers.deleteSelfView,
);

router.delete(
  '/:id',
  auth('admin'),
  validation(ViewValidations.viewOperationValidationSchema),
  ViewControllers.deleteView,
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
  validation(ViewValidations.createViewValidationSchema),
  ViewControllers.createView,
);

const ViewRoutes = router;

export default ViewRoutes;
