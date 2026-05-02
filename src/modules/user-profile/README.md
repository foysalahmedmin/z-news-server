# User Profile & Reputation Module

## Overview

Complete user profile system with reputation scoring, badges, activity tracking, and following functionality.

## Features

- ✅ Rich user profiles with bio, location, website, social links
- ✅ Reputation scoring system
- ✅ Badge system
- ✅ Activity tracking (comments, reactions, articles read)
- ✅ Reading streak tracking
- ✅ Follow authors, categories, and topics
- ✅ Notification preferences
- ✅ Email frequency settings
- ✅ Verified reader status
- ✅ Premium user support
- ✅ Top users leaderboard

## Files Created

1. `user-profile.type.ts` - TypeScript type definitions
2. `user-profile.model.ts` - Mongoose schema and model
3. `user-profile.validation.ts` - Zod validation schemas
4. `user-profile.service.ts` - Business logic
5. `user-profile.controller.ts` - Request handlers
6. `user-profile.route.ts` - API routes

## API Endpoints

### GET /api/user-profile/me

Get current user's profile (auto-creates if not exists)

- **Auth:** Required
- **Response:** User profile with populated data

### PATCH /api/user-profile/me

Update current user's profile

- **Auth:** Required
- **Body:** `{ bio, location, website, social_links }`
- **Response:** Updated profile

### PATCH /api/user-profile/me/notifications

Update notification preferences

- **Auth:** Required
- **Body:** `{ notification_preferences, email_frequency }`
- **Response:** Updated profile

### POST /api/user-profile/follow/author

Follow an author

- **Auth:** Required
- **Body:** `{ author_id }`
- **Response:** Updated profile

### DELETE /api/user-profile/follow/author/:authorId

Unfollow an author

- **Auth:** Required
- **Response:** Updated profile

### POST /api/user-profile/follow/category

Follow a category

- **Auth:** Required
- **Body:** `{ category_id }`
- **Response:** Updated profile

### DELETE /api/user-profile/follow/category/:categoryId

Unfollow a category

- **Auth:** Required
- **Response:** Updated profile

### POST /api/user-profile/follow/topic

Follow a topic

- **Auth:** Required
- **Body:** `{ topic }`
- **Response:** Updated profile

### DELETE /api/user-profile/follow/topic/:topic

Unfollow a topic

- **Auth:** Required
- **Response:** Updated profile

### GET /api/user-profile/top?limit=10

Get top users by reputation

- **Auth:** Public
- **Query:** `limit` (default: 10)
- **Response:** Array of top users

### GET /api/user-profile/:userId

Get profile by user ID

- **Auth:** Public
- **Response:** User profile

### POST /api/user-profile/:userId/badge

Add badge to user (Admin only)

- **Auth:** super-admin, admin
- **Body:** `{ badge_id }`
- **Response:** Updated profile

## Database Schema

```typescript
{
  user: ObjectId (ref: User, unique),
  bio: String (max 500),
  location: String (max 100),
  website: String (max 200),
  social_links: {
    twitter: String,
    facebook: String,
    linkedin: String,
    instagram: String
  },

  // Reputation
  reputation_score: Number (default: 0),
  badges: [{
    badge_id: ObjectId (ref: Badge),
    earned_at: Date
  }],

  // Activity Stats
  total_comments: Number (default: 0),
  total_reactions: Number (default: 0),
  articles_read: Number (default: 0),
  reading_streak: Number (default: 0),
  last_read_at: Date,

  // Preferences
  notification_preferences: {
    email_notifications: Boolean,
    push_notifications: Boolean,
    comment_replies: Boolean,
    article_updates: Boolean,
    newsletter: Boolean
  },
  email_frequency: 'instant' | 'daily' | 'weekly' | 'never',

  // Following
  following_authors: [ObjectId (ref: User)],
  following_categories: [ObjectId (ref: Category)],
  following_topics: [String],

  is_verified_reader: Boolean,
  is_premium: Boolean,
  is_deleted: Boolean,
  created_at: Date,
  updated_at: Date
}
```

## Indexes

- `user` (unique)
- `reputation_score` (descending)
- `is_verified_reader`
- `is_premium`
- `created_at` (descending)

## Static Methods

- `getProfileByUserId(userId)` - Get profile with populated data
- `updateReputationScore(userId, points)` - Add/subtract reputation points
- `incrementActivityStat(userId, stat)` - Increment activity counters

## Integration Points

### 1. Auto-create profile on user registration

```typescript
// In auth.service.ts after user creation
import { UserProfileService } from '../user-profile/user-profile.service';

await UserProfileService.createOrGetProfile(newUser._id);
```

### 2. Update activity stats

```typescript
// In comment.service.ts after creating comment
await UserProfile.incrementActivityStat(userId, 'total_comments');

// In reaction.service.ts after creating reaction
await UserProfile.incrementActivityStat(userId, 'total_reactions');

// In view.service.ts after creating view
await UserProfile.incrementActivityStat(userId, 'articles_read');
await UserProfileService.updateReadingStreak(userId);
```

### 3. Update reputation score

```typescript
// Award points for quality contributions
await UserProfile.updateReputationScore(userId, 10); // Add 10 points
await UserProfile.updateReputationScore(userId, -5); // Subtract 5 points
```

## Reputation Point System (Suggested)

- **Article Read:** +1 point
- **Comment Posted:** +2 points
- **Quality Comment (upvoted):** +5 points
- **Article Shared:** +3 points
- **Consecutive Reading Streak (7 days):** +10 points
- **Consecutive Reading Streak (30 days):** +50 points
- **Spam/Inappropriate Content:** -10 points

## Next Steps

1. ✅ Module created
2. ⏳ Add to main routes
3. ⏳ Create Badge module
4. ⏳ Integrate with Comment/Reaction/View services
5. ⏳ Create admin panel UI
6. ⏳ Create website profile page
7. ⏳ Add tests
