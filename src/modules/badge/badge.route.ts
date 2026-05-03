import { Router } from 'express';
import auth from '../../middlewares/auth.middleware';
import validation from '../../middlewares/validation.middleware';
import { BadgeController } from './badge.controller';
import { BadgeValidation } from './badge.validator';

const router = Router();

// Create badge (Admin only)
router.post(
  '/',
  auth('super-admin', 'admin'),
  validation(BadgeValidation.createBadgeSchema),
  BadgeController.createBadge,
);

// Seed default badges (Super Admin only)
router.post('/seed', auth('super-admin'), BadgeController.seedDefaultBadges);

// Get badge progress for authenticated user
router.get(
  '/progress',
  auth(
    'super-admin',
    'admin',
    'editor',
    'author',
    'contributor',
    'subscriber',
    'user',
  ),
  BadgeController.getBadgeProgress,
);

// Get all badges (Public)
router.get('/', BadgeController.getAllBadges);

// Get active badges (Public)
router.get('/active', BadgeController.getActiveBadges);

// Get badges by category (Public)
router.get(
  '/category/:category',
  validation(BadgeValidation.getBadgesByCategorySchema),
  BadgeController.getBadgesByCategory,
);

// Get badge by ID (Public)
router.get('/:badgeId', BadgeController.getBadgeById);

// Update badge (Admin only)
router.patch(
  '/:badgeId',
  auth('super-admin', 'admin'),
  validation(BadgeValidation.updateBadgeSchema),
  BadgeController.updateBadge,
);

// Delete badge (Admin only)
router.delete(
  '/:badgeId',
  auth('super-admin', 'admin'),
  validation(BadgeValidation.badgeOperationSchema),
  BadgeController.deleteBadge,
);

// Check and award badges to user (Admin only)
router.post(
  '/award/:userId',
  auth('super-admin', 'admin'),
  validation(BadgeValidation.awardBadgeSchema),
  BadgeController.checkAndAwardBadges,
);

const BadgeRoutes = router;

export default BadgeRoutes;
