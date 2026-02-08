import httpStatus from 'http-status';
import AppError from '../../builder/app-error';
import { Badge } from '../badge/badge.model';
import { Category } from '../category/category.model';
import { User } from '../user/user.model';
import { UserProfile } from './user-profile.model';
import { TUserProfile } from './user-profile.type';

// Create or get user profile
const createOrGetProfile = async (userId: string) => {
  let profile = await UserProfile.getProfileByUserId(userId);

  if (!profile) {
    // Create default profile
    profile = await UserProfile.create({
      user: userId,
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
    profile = await UserProfile.getProfileByUserId(userId);
  }

  return profile;
};

// Get profile by user ID
const getProfileByUserId = async (userId: string) => {
  const profile = await UserProfile.getProfileByUserId(userId);

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
  const profile = await UserProfile.findOne({ user: userId });

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

  return await UserProfile.getProfileByUserId(userId);
};

// Update notification preferences
const updateNotificationPreferences = async (
  userId: string,
  payload: {
    notification_preferences?: TUserProfile['notification_preferences'];
    email_frequency?: TUserProfile['email_frequency'];
  },
) => {
  const profile = await UserProfile.findOne({ user: userId });

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
  const author = await User.findById(authorId);
  if (!author) {
    throw new AppError(httpStatus.NOT_FOUND, 'Author not found');
  }

  const profile = await UserProfile.findOne({ user: userId });

  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, 'Profile not found');
  }

  // Check if already following
  if (profile.following_authors.includes(authorId as any)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Already following this author');
  }

  profile.following_authors.push(authorId as any);
  await profile.save();

  return profile;
};

// Unfollow an author
const unfollowAuthor = async (userId: string, authorId: string) => {
  const profile = await UserProfile.findOne({ user: userId });

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
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }

  const profile = await UserProfile.findOne({ user: userId });

  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, 'Profile not found');
  }

  // Check if already following
  if (profile.following_categories.includes(categoryId as any)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Already following this category',
    );
  }

  profile.following_categories.push(categoryId as any);
  await profile.save();

  return profile;
};

// Unfollow a category
const unfollowCategory = async (userId: string, categoryId: string) => {
  const profile = await UserProfile.findOne({ user: userId });

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
  const profile = await UserProfile.findOne({ user: userId });

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
  const profile = await UserProfile.findOne({ user: userId });

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
  const profile = await UserProfile.findOne({ user: userId });

  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, 'Profile not found');
  }

  // Check if badge exists
  const badge = await Badge.findById(badgeId);

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
    badge_id: badge._id as any,
    earned_at: new Date(),
  });

  // Award reputation points
  profile.reputation_score += badge.points;

  await profile.save();

  return await UserProfile.getProfileByUserId(userId);
};

// Update reading streak
const updateReadingStreak = async (userId: string) => {
  const profile = await UserProfile.findOne({ user: userId });

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
  const profiles = await UserProfile.find()
    .sort({ reputation_score: -1 })
    .limit(limit)
    .populate('user', 'name email image');

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
