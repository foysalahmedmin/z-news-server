import httpStatus from 'http-status';
import catchAsync from '../../utils/catch-async';
import sendResponse from '../../utils/send-response';
import { BadgeService } from './badge.service';

// Create badge
const createBadge = catchAsync(async (req, res) => {
  const badge = await BadgeService.createBadge(req.body);

  sendResponse(res, {
    success: true,
    status: httpStatus.CREATED,
    message: 'Badge created successfully',
    data: badge,
  });
});

// Get all badges
const getAllBadges = catchAsync(async (req, res) => {
  const badges = await BadgeService.getAllBadges(req.query);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Badges retrieved successfully',
    data: badges,
  });
});

// Get active badges
const getActiveBadges = catchAsync(async (_req, res) => {
  const badges = await BadgeService.getActiveBadges();

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Active badges retrieved successfully',
    data: badges,
  });
});

// Get badges by category
const getBadgesByCategory = catchAsync(async (req, res) => {
  const { category } = req.params;

  const badges = await BadgeService.getBadgesByCategory(category as any);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: `${category} badges retrieved successfully`,
    data: badges,
  });
});

// Get badge by ID
const getBadgeById = catchAsync(async (req, res) => {
  const { badgeId } = req.params;

  const badge = await BadgeService.getBadgeById(badgeId);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Badge retrieved successfully',
    data: badge,
  });
});

// Update badge
const updateBadge = catchAsync(async (req, res) => {
  const { badgeId } = req.params;

  const badge = await BadgeService.updateBadge(badgeId, req.body);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Badge updated successfully',
    data: badge,
  });
});

// Delete badge
const deleteBadge = catchAsync(async (req, res) => {
  const { badgeId } = req.params;

  await BadgeService.deleteBadge(badgeId);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Badge deleted successfully',
    data: null,
  });
});

// Check and award badges to user
const checkAndAwardBadges = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const newBadges = await BadgeService.checkAndAwardBadges(userId);

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: `Awarded ${newBadges.length} new badge(s)`,
    data: newBadges,
  });
});

// Seed default badges
const seedDefaultBadges = catchAsync(async (_req, res) => {
  const badges = await BadgeService.seedDefaultBadges();

  sendResponse(res, {
    success: true,
    status: httpStatus.OK,
    message: 'Default badges seeded successfully',
    data: badges,
  });
});

export const BadgeController = {
  createBadge,
  getAllBadges,
  getActiveBadges,
  getBadgesByCategory,
  getBadgeById,
  updateBadge,
  deleteBadge,
  checkAndAwardBadges,
  seedDefaultBadges,
};
