import express from 'express';
import auth from '../../middlewares/auth.middleware';
import storage from '../../middlewares/storage.middleware';
import validation from '../../middlewares/validation.middleware';
import * as StorageControllers from './storage.controller';
import * as StorageValidations from './storage.validation';

const router = express.Router();

// POST - Upload asset to cloud
router.post(
  '/',
  auth('super-admin', 'admin', 'editor', 'author', 'contributor'),
  storage({
    name: 'file',
    size: 20 * 1024 * 1024, // 20MB
    makePublic: true,
  }),
  validation(StorageValidations.createStorageValidationSchema),
  StorageControllers.createStorage,
);

// GET
router.get(
  '/',
  auth('super-admin', 'admin', 'editor'),
  StorageControllers.getStorages,
);

router.get(
  '/self',
  auth('super-admin', 'admin', 'editor', 'author', 'contributor'),
  StorageControllers.getSelfStorages,
);

router.get(
  '/:id',
  auth('super-admin', 'admin', 'editor'),
  validation(StorageValidations.storageOperationValidationSchema),
  StorageControllers.getStorage,
);

// PATCH
router.patch(
  '/bulk',
  auth('super-admin', 'admin', 'editor'),
  validation(StorageValidations.updateStoragesValidationSchema),
  StorageControllers.updateStorages,
);

router.patch(
  '/:id',
  auth('super-admin', 'admin', 'editor', 'author'),
  validation(StorageValidations.updateStorageValidationSchema),
  StorageControllers.updateStorage,
);

// DELETE
router.delete(
  '/bulk/permanent',
  auth('super-admin', 'admin'),
  validation(StorageValidations.storagesOperationValidationSchema),
  StorageControllers.deleteStoragesPermanent,
);

router.delete(
  '/bulk',
  auth('super-admin', 'admin', 'editor'),
  validation(StorageValidations.storagesOperationValidationSchema),
  StorageControllers.deleteStorages,
);

router.delete(
  '/:id/permanent',
  auth('super-admin', 'admin'),
  validation(StorageValidations.storageOperationValidationSchema),
  StorageControllers.deleteStoragePermanent,
);

router.delete(
  '/:id',
  auth('super-admin', 'admin', 'editor', 'author'),
  validation(StorageValidations.storageOperationValidationSchema),
  StorageControllers.deleteStorage,
);

// POST - Restore
router.post(
  '/bulk/restore',
  auth('super-admin', 'admin'),
  validation(StorageValidations.storagesOperationValidationSchema),
  StorageControllers.restoreStorages,
);

router.post(
  '/:id/restore',
  auth('super-admin', 'admin'),
  validation(StorageValidations.storageOperationValidationSchema),
  StorageControllers.restoreStorage,
);

const storageRoutes = router;

export default storageRoutes;
