import express from 'express';
import auth from '../../middlewares/auth.middleware';
import file from '../../middlewares/file.middleware';
import validation from '../../middlewares/validation.middleware';
import * as FileControllers from './file.controller';
import * as FileValidations from './file.validation';

const router = express.Router();

// POST - Upload file
router.post(
  '/',
  auth('super-admin', 'admin', 'editor', 'author', 'contributor'),
  file({
    name: 'file',
    folder: 'files',
    size: 50 * 1024 * 1024, // 50MB
  }),
  validation(FileValidations.createFileValidationSchema),
  FileControllers.createFile,
);

// GET
router.get(
  '/',
  auth('super-admin', 'admin', 'editor'),
  FileControllers.getFiles,
);

router.get(
  '/self',
  auth('super-admin', 'admin', 'editor', 'author', 'contributor'),
  FileControllers.getSelfFiles,
);

router.get(
  '/:id',
  auth('super-admin', 'admin', 'editor'),
  validation(FileValidations.fileOperationValidationSchema),
  FileControllers.getFile,
);

// PATCH
router.patch(
  '/bulk',
  auth('super-admin', 'admin', 'editor'),
  validation(FileValidations.updateFilesValidationSchema),
  FileControllers.updateFiles,
);

router.patch(
  '/:id',
  auth('super-admin', 'admin', 'editor', 'author'),
  validation(FileValidations.updateFileValidationSchema),
  FileControllers.updateFile,
);

// DELETE
router.delete(
  '/bulk/permanent',
  auth('super-admin', 'admin'),
  validation(FileValidations.filesOperationValidationSchema),
  FileControllers.deleteFilesPermanent,
);

router.delete(
  '/bulk',
  auth('super-admin', 'admin', 'editor'),
  validation(FileValidations.filesOperationValidationSchema),
  FileControllers.deleteFiles,
);

router.delete(
  '/:id/permanent',
  auth('super-admin', 'admin'),
  validation(FileValidations.fileOperationValidationSchema),
  FileControllers.deleteFilePermanent,
);

router.delete(
  '/:id',
  auth('super-admin', 'admin', 'editor', 'author'),
  validation(FileValidations.fileOperationValidationSchema),
  FileControllers.deleteFile,
);

// POST - Restore
router.post(
  '/bulk/restore',
  auth('super-admin', 'admin'),
  validation(FileValidations.filesOperationValidationSchema),
  FileControllers.restoreFiles,
);

router.post(
  '/:id/restore',
  auth('super-admin', 'admin'),
  validation(FileValidations.fileOperationValidationSchema),
  FileControllers.restoreFile,
);

const fileRoutes = router;

export default fileRoutes;

