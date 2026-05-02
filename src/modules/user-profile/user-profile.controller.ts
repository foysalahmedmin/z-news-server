import httpStatus from 'http-status';
// import catchAsync from '../../utils/catchAsync';
// import sendResponse from '../../utils/sendResponse';
import { UserProfileService } from './user-profile.service';
import catchAsync from '../../utils/catch-async';
import sendResponse from '../../utils/send-response';

// Get my profile
const getMyProfile = catchAsync(async (req, res) => {
  const userId = req.user?._id;

  const profile = await UserProfileService.createOrGetProfile(userId);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Profile retrieved successfully',
    data: profile,
  });
});

// Get profile by user ID
const getProfileByUserId = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const profile = await UserProfileService.getProfileByUserId(userId);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Profile retrieved successfully',
    data: profile,
  });
});

// Update my profile
const updateMyProfile = catchAsync(async (req, res) => {
  const userId = req.user?._id;

  const profile = await UserProfileService.updateProfile(userId, req.body);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Profile updated successfully',
    data: profile,
  });
});

// Update notification preferences
const updateNotificationPreferences = catchAsync(async (req, res) => {
  const userId = req.user?._id;

  const profile = await UserProfileService.updateNotificationPreferences(
    userId,
    req.body,
  );

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Notification preferences updated successfully',
    data: profile,
  });
});

// Follow an author
const followAuthor = catchAsync(async (req, res) => {
  const userId = req.user?._id;
  const { author_id } = req.body;

  const profile = await UserProfileService.followAuthor(userId, author_id);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Author followed successfully',
    data: profile,
  });
});

// Unfollow an author
const unfollowAuthor = catchAsync(async (req, res) => {
  const userId = req.user?._id;
  const { authorId } = req.params;

  const profile = await UserProfileService.unfollowAuthor(userId, authorId);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Author unfollowed successfully',
    data: profile,
  });
});

// Follow a category
const followCategory = catchAsync(async (req, res) => {
  const userId = req.user?._id;
  const { category_id } = req.body;

  const profile = await UserProfileService.followCategory(userId, category_id);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Category followed successfully',
    data: profile,
  });
});

// Unfollow a category
const unfollowCategory = catchAsync(async (req, res) => {
  const userId = req.user?._id;
  const { categoryId } = req.params;

  const profile = await UserProfileService.unfollowCategory(userId, categoryId);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Category unfollowed successfully',
    data: profile,
  });
});

// Follow a topic
const followTopic = catchAsync(async (req, res) => {
  const userId = req.user?._id;
  const { topic } = req.body;

  const profile = await UserProfileService.followTopic(userId, topic);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Topic followed successfully',
    data: profile,
  });
});

// Unfollow a topic
const unfollowTopic = catchAsync(async (req, res) => {
  const userId = req.user?._id;
  const { topic } = req.params;

  const profile = await UserProfileService.unfollowTopic(userId, topic);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Topic unfollowed successfully',
    data: profile,
  });
});

// Add badge to user (Admin only)
const addBadge = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { badge_id } = req.body;

  const profile = await UserProfileService.addBadge(userId, badge_id);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Badge added successfully',
    data: profile,
  });
});

// Get top users by reputation
const getTopUsersByReputation = catchAsync(async (req, res) => {
  const limit = Number(req.query.limit) || 10;

  const profiles = await UserProfileService.getTopUsersByReputation(limit);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Top users retrieved successfully',
    data: profiles,
  });
});

export const UserProfileController = {
  getMyProfile,
  getProfileByUserId,
  updateMyProfile,
  updateNotificationPreferences,
  followAuthor,
  unfollowAuthor,
  followCategory,
  unfollowCategory,
  followTopic,
  unfollowTopic,
  addBadge,
  getTopUsersByReputation,
};
