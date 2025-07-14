import express from 'express';
import auth from '../../middlewares/auth.middleware';
import validation from '../../middlewares/validation.middleware';
import * as CategoryControllers from './notification.controller';
import * as CategoryValidations from './notification.validation';

const router = express.Router();

// GET
router.get('/', auth('admin'), CategoryControllers.getCategories);

router.get(
  '/:id',
  auth('admin'),
  validation(CategoryValidations.categoryOperationValidationSchema),
  CategoryControllers.getCategory,
);

// PATCH
router.patch(
  '/bulk',
  auth('admin'),
  validation(CategoryValidations.updateCategoriesValidationSchema),
  CategoryControllers.updateCategories,
);

router.patch(
  '/:id',
  auth('admin'),
  validation(CategoryValidations.updateCategoryValidationSchema),
  CategoryControllers.updateCategory,
);

// DELETE
router.delete(
  '/bulk/permanent',
  auth('admin'),
  validation(CategoryValidations.categoriesOperationValidationSchema),
  CategoryControllers.deleteCategoriesPermanent,
);

router.delete(
  '/bulk',
  auth('admin'),
  validation(CategoryValidations.categoriesOperationValidationSchema),
  CategoryControllers.deleteCategories,
);

router.delete(
  '/:id/permanent',
  auth('admin'),
  validation(CategoryValidations.categoryOperationValidationSchema),
  CategoryControllers.deleteCategoryPermanent,
);

router.delete(
  '/:id',
  auth('admin'),
  validation(CategoryValidations.categoryOperationValidationSchema),
  CategoryControllers.deleteCategory,
);

// POST
router.post(
  '/',
  auth('admin'),
  validation(CategoryValidations.createCategoryValidationSchema),
  CategoryControllers.createCategory,
);

router.post(
  '/bulk/restore',
  auth('admin'),
  validation(CategoryValidations.categoriesOperationValidationSchema),
  CategoryControllers.restoreCategories,
);

router.post(
  '/:id/restore',
  auth('admin'),
  validation(CategoryValidations.categoryOperationValidationSchema),
  CategoryControllers.restoreCategory,
);

const categoryRoutes = router;

export default categoryRoutes;
