import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../builder/app-error';
import * as BadgeRepository from '../badge/badge.repository';
import * as CategoryRepository from '../category/category.repository';
import * as UserRepository from '../user/user.repository';
import * as UserProfileRepository from './user-profile.repository';
import { TUserProfile } from './user-profile.type';

// Create or get user profile
const createOrGetProfile = async (userId: string) => {
  let profile = await UserProfileRepository.findByUserId(userId);

  if (!profile) {
    // Create default profile
    await UserProfileRepository.create({
      user: userId as unknown as mongoose.Types.ObjectId,
      notification_preferences: {
        email_notifications: true,
        push_notifications: true,
        comment_replies: true,
        article_updates: true,
        newsletter: true,
      },
      email_frequency: 'daily',
    });

    // Populate the profile
    profile = await UserProfileRepository.findByUserId(userId);
  }

  return profile;
};

// Get profile by user ID
const getProfileByUserId = async (userId: string) => {
  const profile = await UserProfileRepository.findByUserId(userId);

  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, 'Profile not found');
  }

  return profile;
};

// Update profile
const updateProfile = async (
  userId: string,
  payload: Partial<TUserProfile>,
) => {
  const profile = await UserProfileRepository.findOne({ user: userId });

  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, 'Profile not found');
  }

  // Update allowed fields
  if (payload.bio !== undefined) profile.bio = payload.bio;
  if (payload.location !== undefined) profile.location = payload.location;
  if (payload.website !== undefined) profile.website = payload.website;
  if (payload.social_links !== undefined)
    profile.social_links = payload.social_links;

  await profile.save();

  return await UserProfileRepository.findByUserId(userId);
};

// Update notification preferences
const updateNotificationPreferences = async (
  userId: string,
  payload: {
    notification_preferences?: TUserProfile['notification_preferences'];
    email_frequency?: TUserProfile['email_frequency'];
  },
) => {
  const profile = await UserProfileRepository.findOne({ user: userId });

  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, 'Profile not found');
  }

  if (payload.notification_preferences) {
    profile.notification_preferences = {
      ...profile.notification_preferences,
      ...payload.notification_preferences,
    };
  }

  if (payload.email_frequency) {
    profile.email_frequency = payload.email_frequency;
  }

  await profile.save();

  return profile;
};

// Follow an author
const followAuthor = async (userId: string, authorId: string) => {
  // Check if author exists
  const author = await UserRepository.findById(authorId);
  if (!author) {
    throw new AppError(httpStatus.NOT_FOUND, 'Author not found');
  }

  const profile = await UserProfileRepository.findOne({ user: userId });

  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, 'Profile not found');
  }

  // Check if already following
  if (
    profile.following_authors.includes(
      authorId as unknown as mongoose.Types.ObjectId,
    )
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Already following this author');
  }

  profile.following_authors.push(
    authorId as unknown as mongoose.Types.ObjectId,
  );
  await profile.save();

  return profile;
};

// Unfollow an author
const unfollowAuthor = async (userId: string, authorId: string) => {
  const profile = await UserProfileRepository.findOne({ user: userId });

  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, 'Profile not found');
  }

  profile.following_authors = profile.following_authors.filter(
    (id) => id.toString() !== authorId,
  );

  await profile.save();

  return profile;
};

// Follow a category
const followCategory = async (userId: string, categoryId: string) => {
  // Check if category exists
  const category = await CategoryRepository.findById(categoryId);
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }

  const profile = await UserProfileRepository.findOne({ user: userId });

  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, 'Profile not found');
  }

  // Check if already following
  if (
    profile.following_categories.includes(
      categoryId as unknown as mongoose.Types.ObjectId,
    )
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Already following this category',
    );
  }

  profile.following_categories.push(
    categoryId as unknown as mongoose.Types.ObjectId,
  );
  await profile.save();

  return profile;
};

// Unfollow a category
const unfollowCategory = async (userId: string, categoryId: string) => {
  const profile = await UserProfileRepository.findOne({ user: userId });

  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, 'Profile not found');
  }

  profile.following_categories = profile.following_categories.filter(
    (id) => id.toString() !== categoryId,
  );

  await profile.save();

  return profile;
};

// Follow a topic
const followTopic = async (userId: string, topic: string) => {
  const profile = await UserProfileRepository.findOne({ user: userId });

  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, 'Profile not found');
  }

  // Check if already following
  if (profile.following_topics.includes(topic)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Already following this topic');
  }

  profile.following_topics.push(topic);
  await profile.save();

  return profile;
};

// Unfollow a topic
const unfollowTopic = async (userId: string, topic: string) => {
  const profile = await UserProfileRepository.findOne({ user: userId });

  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, 'Profile not found');
  }

  profile.following_topics = profile.following_topics.filter(
    (t) => t !== topic,
  );

  await profile.save();

  return profile;
};

// Add badge to user (Admin only)
const addBadge = async (userId: string, badgeId: string) => {
  const profile = await UserProfileRepository.findOne({ user: userId });

  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, 'Profile not found');
  }

  // Check if badge exists
  const badge = await BadgeRepository.findById(badgeId);

  if (!badge) {
    throw new AppError(httpStatus.NOT_FOUND, 'Badge not found');
  }

  // Check if badge already exists
  const hasBadge = profile.badges.some(
    (b) => b.badge_id.toString() === badgeId,
  );

  if (hasBadge) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User already has this badge');
  }

  profile.badges.push({
    badge_id: badge._id as mongoose.Types.ObjectId,
    earned_at: new Date(),
  });

  // Award reputation points
  profile.reputation_score += badge.points;

  await profile.save();

  return await UserProfileRepository.findByUserId(userId);
};

// Update reading streak
const updateReadingStreak = async (userId: string) => {
  const profile = await UserProfileRepository.findOne({ user: userId });

  if (!profile) {
    return;
  }

  const now = new Date();
  const lastRead = profile.last_read_at;

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (!lastRead) {
    // First time reading
    profile.reading_streak = 1;
  } else {
    const lastReadDate = new Date(
      lastRead.getFullYear(),
      lastRead.getMonth(),
      lastRead.getDate(),
    );

    const diffTime = Math.abs(today.getTime() - lastReadDate.getTime());
    const daysSinceLastRead = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysSinceLastRead === 1) {
      // Consecutive day
      profile.reading_streak += 1;
    } else if (daysSinceLastRead > 1) {
      // Streak broken
      profile.reading_streak = 1;
    }
    // Same day - no change
  }

  profile.last_read_at = now;
  await profile.save();

  return profile;
};

// Get top users by reputation
const getTopUsersByReputation = async (limit: number = 10) => {
  const profiles = await UserProfileRepository.findMany(
    {},
    [{ path: 'user', select: 'name email image' }],
    { reputation_score: -1 },
    limit,
  );

  return profiles;
};

export const UserProfileService = {
  createOrGetProfile,
  getProfileByUserId,
  updateProfile,
  updateNotificationPreferences,
  followAuthor,
  unfollowAuthor,
  followCategory,
  unfollowCategory,
  followTopic,
  unfollowTopic,
  addBadge,
  updateReadingStreak,
  getTopUsersByReputation,
};
