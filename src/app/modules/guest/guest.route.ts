import express from 'express';
import auth from '../../middlewares/auth.middleware';
import validation from '../../middlewares/validation.middleware';
import * as GuestControllers from './guest.controller';
import * as GuestValidations from './guest.validation';

const router = express.Router();

// GET
router.get(
  '/self',
  auth('admin', 'editor', 'author', 'contributor', 'subscriber', 'guest'),
  GuestControllers.getSelf,
);

router.get('/', auth('admin'), GuestControllers.getGuests);

router.get(
  '/:id',
  auth('admin'),
  validation(GuestValidations.guestOperationValidationSchema),
  GuestControllers.getGuest,
);

// PATCH
router.patch(
  '/self',
  auth('admin', 'editor', 'author', 'contributor', 'subscriber', 'guest'),
  validation(GuestValidations.updateSelfValidationSchema),
  GuestControllers.updateSelf,
);

router.patch(
  '/bulk',
  auth('admin'),
  validation(GuestValidations.updateGuestsValidationSchema),
  GuestControllers.updateGuests,
);

router.patch(
  '/:id',
  auth('admin'),
  validation(GuestValidations.updateGuestValidationSchema),
  GuestControllers.updateGuest,
);

// DELETE
router.delete(
  '/bulk/permanent',
  auth('admin'),
  validation(GuestValidations.guestsOperationValidationSchema),
  GuestControllers.deleteGuestsPermanent,
);

router.delete(
  '/bulk',
  auth('admin'),
  validation(GuestValidations.guestsOperationValidationSchema),
  GuestControllers.deleteGuests,
);

router.delete(
  '/:id/permanent',
  auth('admin'),
  validation(GuestValidations.guestOperationValidationSchema),
  GuestControllers.deleteGuestPermanent,
);

router.delete(
  '/:id',
  auth('admin'),
  validation(GuestValidations.guestOperationValidationSchema),
  GuestControllers.deleteGuest,
);

// POST
router.post(
  '/bulk/restore',
  auth('admin'),
  validation(GuestValidations.guestsOperationValidationSchema),
  GuestControllers.restoreGuests,
);

router.post(
  '/:id/restore',
  auth('admin'),
  validation(GuestValidations.guestOperationValidationSchema),
  GuestControllers.restoreGuest,
);

const guestRoutes = router;

export default guestRoutes;
