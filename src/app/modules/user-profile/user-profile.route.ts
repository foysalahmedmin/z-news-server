import { Router } from 'express';
import auth from '../../middlewares/auth.middleware';
import validation from '../../middlewares/validation.middleware';
import { UserProfileController } from './user-profile.controller';
import { UserProfileValidation } from './user-profile.validation';

const router = Router();

// Get my profile
router.get('/me', auth(), UserProfileController.getMyProfile);

// Update my profile
router.patch(
  '/me',
  auth(),
  validation(UserProfileValidation.updateUserProfileSchema),
  UserProfileController.updateMyProfile,
);

// Update notification preferences
router.patch(
  '/me/notifications',
  auth(),
  validation(UserProfileValidation.updateNotificationPreferencesSchema),
  UserProfileController.updateNotificationPreferences,
);

// Follow an author
router.post(
  '/follow/author',
  auth(),
  validation(UserProfileValidation.followAuthorSchema),
  UserProfileController.followAuthor,
);

// Unfollow an author
router.delete(
  '/follow/author/:authorId',
  auth(),
  UserProfileController.unfollowAuthor,
);

// Follow a category
router.post(
  '/follow/category',
  auth(),
  validation(UserProfileValidation.followCategorySchema),
  UserProfileController.followCategory,
);

// Unfollow a category
router.delete(
  '/follow/category/:categoryId',
  auth(),
  UserProfileController.unfollowCategory,
);

// Follow a topic
router.post(
  '/follow/topic',
  auth(),
  validation(UserProfileValidation.followTopicSchema),
  UserProfileController.followTopic,
);

// Unfollow a topic
router.delete(
  '/follow/topic/:topic',
  auth(),
  UserProfileController.unfollowTopic,
);

// Get top users by reputation (Public)
router.get('/top', UserProfileController.getTopUsersByReputation);

// Get profile by user ID (Public)
router.get('/:userId', UserProfileController.getProfileByUserId);

// Add badge to user (Admin only)
router.post(
  '/:userId/badge',
  auth('super-admin', 'admin'),
  validation(UserProfileValidation.addBadgeSchema),
  UserProfileController.addBadge,
);

const UserProfileRoutes = router;

export default UserProfileRoutes;
