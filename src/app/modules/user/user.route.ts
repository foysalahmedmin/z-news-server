import express from 'express';
import auth from '../../middlewares/auth.middleware';
import * as UserControllers from './user.controller';

const router = express.Router();

// GET
router.get(
  '/self',
  auth('admin', 'editor', 'author', 'contributor', 'subscriber'),
  UserControllers.getSelf,
);
router.get('/', auth('admin'), UserControllers.getUsers);
router.get('/:id', auth('admin'), UserControllers.getUser);

// PATCH
router.patch(
  '/self',
  auth('admin', 'editor', 'author', 'contributor', 'subscriber'),
  UserControllers.updateUser,
);
router.patch('/bulk', auth('admin'), UserControllers.updateUsersByAdmin);
router.patch('/:id', auth('admin'), UserControllers.updateUserByAdmin);

// DELETE
router.delete(
  '/bulk/permanent',
  auth('admin'),
  UserControllers.deleteUsersPermanent,
);
router.delete('/bulk', auth('admin'), UserControllers.deleteUsers);
router.delete(
  '/:id/permanent',
  auth('admin'),
  UserControllers.deleteUserPermanent,
);
router.delete('/:id', auth('admin'), UserControllers.deleteUser);

// POST
router.post('/bulk/restore', auth('admin'), UserControllers.restoreUsers);
router.post('/:id/restore', auth('admin'), UserControllers.restoreUser);

const userRoutes = router;

export default userRoutes;
