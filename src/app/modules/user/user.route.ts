import express from 'express';
import auth from '../../middlewares/auth.middleware';
import validation from '../../middlewares/validation.middleware';
import * as UserControllers from './user.controller';
import * as UserValidations from './user.validation';

const router = express.Router();

// GET
router.get(
  '/self',
  auth('admin', 'editor', 'author', 'contributor', 'subscriber'),
  UserControllers.getSelf,
);

router.get('/', auth('admin'), UserControllers.getUsers);

router.get(
  '/:id',
  auth('admin'),
  validation(UserValidations.userOperationValidationSchema),
  UserControllers.getUser,
);

// PATCH
router.patch(
  '/self',
  auth('admin', 'editor', 'author', 'contributor', 'subscriber'),
  validation(UserValidations.updateUserValidationSchema),
  UserControllers.updateUser,
);

router.patch(
  '/bulk',
  auth('admin'),
  validation(UserValidations.updateUsersByAdminValidationSchema),
  UserControllers.updateUsersByAdmin,
);

router.patch(
  '/:id',
  auth('admin'),
  validation(UserValidations.updateUserByAdminValidationSchema),
  UserControllers.updateUserByAdmin,
);

// DELETE
router.delete(
  '/bulk/permanent',
  auth('admin'),
  validation(UserValidations.usersOperationValidationSchema),
  UserControllers.deleteUsersPermanent,
);

router.delete(
  '/bulk',
  auth('admin'),
  validation(UserValidations.usersOperationValidationSchema),
  UserControllers.deleteUsers,
);

router.delete(
  '/:id/permanent',
  auth('admin'),
  validation(UserValidations.userOperationValidationSchema),
  UserControllers.deleteUserPermanent,
);

router.delete(
  '/:id',
  auth('admin'),
  validation(UserValidations.userOperationValidationSchema),
  UserControllers.deleteUser,
);

// POST
router.post(
  '/bulk/restore',
  auth('admin'),
  validation(UserValidations.usersOperationValidationSchema),
  UserControllers.restoreUsers,
);

router.post(
  '/:id/restore',
  auth('admin'),
  validation(UserValidations.userOperationValidationSchema),
  UserControllers.restoreUser,
);

const userRoutes = router;

export default userRoutes;
