import httpStatus from 'http-status';
import { UserProfile } from '../user-profile/user-profile.model';
import { Badge } from './badge.model';
import { TBadge } from './badge.type';
import AppError from '../../builder/app-error';

// Create badge
const createBadge = async (payload: TBadge) => {
  const badge = await Badge.create(payload);
  return badge;
};

// Get all badges
const getAllBadges = async (query: any) => {
  const filter: any = {};

  if (query.category) {
    filter.category = query.category;
  }

  if (query.rarity) {
    filter.rarity = query.rarity;
  }

  if (query.is_active !== undefined) {
    filter.is_active = query.is_active === 'true';
  }

  const badges = await Badge.find(filter).sort({ category: 1, rarity: 1 });

  return badges;
};

// Get active badges
const getActiveBadges = async () => {
  const badges = await Badge.getActiveBadges();
  return badges;
};

// Get badges by category
const getBadgesByCategory = async (category: TBadge['category']) => {
  const badges = await Badge.getBadgesByCategory(category);
  return badges;
};

// Get badge by ID
const getBadgeById = async (badgeId: string) => {
  const badge = await Badge.findById(badgeId);

  if (!badge) {
    throw new AppError(httpStatus.NOT_FOUND, 'Badge not found');
  }

  return badge;
};

// Update badge
const updateBadge = async (badgeId: string, payload: Partial<TBadge>) => {
  const badge = await Badge.findById(badgeId);

  if (!badge) {
    throw new AppError(httpStatus.NOT_FOUND, 'Badge not found');
  }

  Object.assign(badge, payload);
  await badge.save();

  return badge;
};

// Delete badge
const deleteBadge = async (badgeId: string) => {
  const badge = await Badge.findById(badgeId);

  if (!badge) {
    throw new AppError(httpStatus.NOT_FOUND, 'Badge not found');
  }

  await badge.softDelete();

  return badge;
};

// Check and award badges to user
const checkAndAwardBadges = async (userId: string) => {
  const profile = await UserProfile.findOne({ user: userId });

  if (!profile) {
    return [];
  }

  const allBadges = await Badge.getActiveBadges();
  const earnedBadgeIds = profile.badges.map((b) => b.badge_id.toString());
  const newBadges: any[] = [];

  for (const badge of allBadges!) {
    // Skip if already earned
    if (earnedBadgeIds.includes(badge._id.toString())) {
      continue;
    }

    let shouldAward = false;

    // Check criteria
    switch (badge.criteria.type) {
      case 'articles_read':
        shouldAward = profile.articles_read >= badge.criteria.threshold;
        break;

      case 'comments_posted':
        shouldAward = profile.total_comments >= badge.criteria.threshold;
        break;

      case 'reading_streak':
        shouldAward = profile.reading_streak >= badge.criteria.threshold;
        break;

      case 'reputation_score':
        shouldAward = profile.reputation_score >= badge.criteria.threshold;
        break;

      case 'years_member':
        const yearsSinceCreation =
          (Date.now() - profile.created_at!.getTime()) /
          (1000 * 60 * 60 * 24 * 365);
        shouldAward = yearsSinceCreation >= badge.criteria.threshold;
        break;

      case 'custom':
        // Custom badges are awarded manually
        shouldAward = false;
        break;
    }

    if (shouldAward) {
      // Award badge
      profile.badges.push({
        badge_id: badge._id as any,
        earned_at: new Date(),
      });

      // Award reputation points
      profile.reputation_score += badge.points;

      newBadges.push(badge);
    }
  }

  if (newBadges.length > 0) {
    await profile.save();
  }

  return newBadges;
};

// Seed default badges
const seedDefaultBadges = async () => {
  const defaultBadges: Partial<TBadge>[] = [
    // Reader Badges
    {
      name: 'First Article',
      description: 'Read your first article',
      icon: '📖',
      category: 'reader',
      criteria: {
        type: 'articles_read',
        threshold: 1,
        description: 'Read 1 article',
      },
      rarity: 'common',
      points: 5,
      is_active: true,
    },
    {
      name: 'Bookworm',
      description: 'Read 100 articles',
      icon: '🐛',
      category: 'reader',
      criteria: {
        type: 'articles_read',
        threshold: 100,
        description: 'Read 100 articles',
      },
      rarity: 'rare',
      points: 50,
      is_active: true,
    },
    {
      name: 'News Addict',
      description: 'Read 500 articles',
      icon: '📰',
      category: 'reader',
      criteria: {
        type: 'articles_read',
        threshold: 500,
        description: 'Read 500 articles',
      },
      rarity: 'epic',
      points: 200,
      is_active: true,
    },

    // Engagement Badges
    {
      name: 'First Comment',
      description: 'Post your first comment',
      icon: '💬',
      category: 'engagement',
      criteria: {
        type: 'comments_posted',
        threshold: 1,
        description: 'Post 1 comment',
      },
      rarity: 'common',
      points: 5,
      is_active: true,
    },
    {
      name: 'Conversationalist',
      description: 'Post 50 comments',
      icon: '🗣️',
      category: 'engagement',
      criteria: {
        type: 'comments_posted',
        threshold: 50,
        description: 'Post 50 comments',
      },
      rarity: 'rare',
      points: 50,
      is_active: true,
    },
    {
      name: 'Community Leader',
      description: 'Post 200 comments',
      icon: '👑',
      category: 'engagement',
      criteria: {
        type: 'comments_posted',
        threshold: 200,
        description: 'Post 200 comments',
      },
      rarity: 'epic',
      points: 150,
      is_active: true,
    },

    // Loyalty Badges
    {
      name: 'Week Warrior',
      description: 'Read articles for 7 consecutive days',
      icon: '🔥',
      category: 'loyalty',
      criteria: {
        type: 'reading_streak',
        threshold: 7,
        description: '7-day reading streak',
      },
      rarity: 'common',
      points: 20,
      is_active: true,
    },
    {
      name: 'Month Master',
      description: 'Read articles for 30 consecutive days',
      icon: '⭐',
      category: 'loyalty',
      criteria: {
        type: 'reading_streak',
        threshold: 30,
        description: '30-day reading streak',
      },
      rarity: 'rare',
      points: 100,
      is_active: true,
    },
    {
      name: 'Year Champion',
      description: 'Read articles for 365 consecutive days',
      icon: '🏆',
      category: 'loyalty',
      criteria: {
        type: 'reading_streak',
        threshold: 365,
        description: '365-day reading streak',
      },
      rarity: 'legendary',
      points: 500,
      is_active: true,
    },

    // Achievement Badges
    {
      name: 'Rising Star',
      description: 'Reach 100 reputation points',
      icon: '🌟',
      category: 'achievement',
      criteria: {
        type: 'reputation_score',
        threshold: 100,
        description: 'Earn 100 reputation points',
      },
      rarity: 'rare',
      points: 0,
      is_active: true,
    },
    {
      name: 'Influencer',
      description: 'Reach 500 reputation points',
      icon: '💎',
      category: 'achievement',
      criteria: {
        type: 'reputation_score',
        threshold: 500,
        description: 'Earn 500 reputation points',
      },
      rarity: 'epic',
      points: 0,
      is_active: true,
    },
    {
      name: 'Legend',
      description: 'Reach 1000 reputation points',
      icon: '👑',
      category: 'achievement',
      criteria: {
        type: 'reputation_score',
        threshold: 1000,
        description: 'Earn 1000 reputation points',
      },
      rarity: 'legendary',
      points: 0,
      is_active: true,
    },

    // Loyalty (Years)
    {
      name: 'One Year Member',
      description: 'Member for 1 year',
      icon: '🎂',
      category: 'loyalty',
      criteria: {
        type: 'years_member',
        threshold: 1,
        description: '1 year membership',
      },
      rarity: 'rare',
      points: 100,
      is_active: true,
    },
  ];

  for (const badgeData of defaultBadges) {
    const exists = await Badge.findOne({ name: badgeData.name });
    if (!exists) {
      await Badge.create(badgeData);
    }
  }

  return await Badge.find();
};

export const BadgeService = {
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
