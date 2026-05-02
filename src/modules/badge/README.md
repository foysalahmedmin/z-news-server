# Badge & Gamification Module

## Overview

Complete badge and gamification system with automatic badge awarding based on user activity.

## Features

- ✅ Badge creation and management
- ✅ Multiple badge categories (Reader, Engagement, Loyalty, Contribution, Achievement)
- ✅ Rarity levels (Common, Rare, Epic, Legendary)
- ✅ Automatic badge awarding based on criteria
- ✅ Reputation points system
- ✅ Default badge seeding
- ✅ Badge tracking per user
- ✅ Public badge showcase

## Files Created

1. `badge.type.ts` - TypeScript type definitions
2. `badge.model.ts` - Mongoose schema and model
3. `badge.validation.ts` - Zod validation schemas
4. `badge.service.ts` - Business logic with auto-award
5. `badge.controller.ts` - Request handlers
6. `badge.route.ts` - API routes

## API Endpoints

### POST /api/badge

Create a new badge (Admin only)

- **Auth:** super-admin, admin
- **Body:** `{ name, description, icon, category, criteria, rarity, points }`
- **Response:** Created badge

### POST /api/badge/seed

Seed default badges (Super Admin only)

- **Auth:** super-admin
- **Response:** Array of seeded badges

### GET /api/badge

Get all badges

- **Auth:** Public
- **Query:** `category`, `rarity`, `is_active`
- **Response:** Array of badges

### GET /api/badge/active

Get active badges only

- **Auth:** Public
- **Response:** Array of active badges

### GET /api/badge/category/:category

Get badges by category

- **Auth:** Public
- **Params:** `category` (reader, engagement, loyalty, contribution, achievement)
- **Response:** Array of badges in category

### GET /api/badge/:badgeId

Get badge by ID

- **Auth:** Public
- **Response:** Badge details

### PATCH /api/badge/:badgeId

Update badge (Admin only)

- **Auth:** super-admin, admin
- **Body:** Partial badge data
- **Response:** Updated badge

### DELETE /api/badge/:badgeId

Delete badge (Admin only)

- **Auth:** super-admin, admin
- **Response:** Success message

### POST /api/badge/award/:userId

Check and award badges to user (Admin only)

- **Auth:** super-admin, admin
- **Response:** Array of newly awarded badges

## Database Schema

```typescript
{
  name: String (unique, required, max 100),
  description: String (required, max 500),
  icon: String (required),
  category: 'reader' | 'engagement' | 'loyalty' | 'contribution' | 'achievement',
  criteria: {
    type: 'articles_read' | 'comments_posted' | 'reading_streak' | 'reputation_score' | 'years_member' | 'custom',
    threshold: Number (required, min 0),
    description: String (required)
  },
  rarity: 'common' | 'rare' | 'epic' | 'legendary',
  points: Number (reputation points awarded, default: 0),
  is_active: Boolean (default: true),
  is_deleted: Boolean,
  created_at: Date,
  updated_at: Date
}
```

## Badge Categories

### 1. Reader Badges

Awarded for reading articles

- First Article (1 article) - Common - 5 points
- Bookworm (100 articles) - Rare - 50 points
- News Addict (500 articles) - Epic - 200 points

### 2. Engagement Badges

Awarded for community participation

- First Comment (1 comment) - Common - 5 points
- Conversationalist (50 comments) - Rare - 50 points
- Community Leader (200 comments) - Epic - 150 points

### 3. Loyalty Badges

Awarded for consistent activity

- Week Warrior (7-day streak) - Common - 20 points
- Month Master (30-day streak) - Rare - 100 points
- Year Champion (365-day streak) - Legendary - 500 points
- One Year Member - Rare - 100 points

### 4. Achievement Badges

Awarded for reaching reputation milestones

- Rising Star (100 reputation) - Rare
- Influencer (500 reputation) - Epic
- Legend (1000 reputation) - Legendary

### 5. Contribution Badges

Custom badges for special contributions (awarded manually)

## Auto-Award Logic

The `checkAndAwardBadges` function automatically checks user activity and awards badges:

```typescript
// Called after user actions
await BadgeService.checkAndAwardBadges(userId);
```

### When to Call Auto-Award:

1. After reading an article
2. After posting a comment
3. After daily login (for streak tracking)
4. After reputation score changes
5. On user profile updates

## Integration Points

### 1. After Article Read

```typescript
// In view.service.ts
await UserProfile.incrementActivityStat(userId, 'articles_read');
await BadgeService.checkAndAwardBadges(userId);
```

### 2. After Comment Posted

```typescript
// In comment.service.ts
await UserProfile.incrementActivityStat(userId, 'total_comments');
await BadgeService.checkAndAwardBadges(userId);
```

### 3. After Daily Login

```typescript
// In auth.service.ts or middleware
await UserProfileService.updateReadingStreak(userId);
await BadgeService.checkAndAwardBadges(userId);
```

### 4. Seed Badges on Server Start

```typescript
// In server.ts or app.ts
import { BadgeService } from './modules/badge/badge.service';

// Seed default badges on first run
await BadgeService.seedDefaultBadges();
```

## Reputation Points System

Badges award reputation points when earned:

- Common badges: 5-20 points
- Rare badges: 50-100 points
- Epic badges: 150-200 points
- Legendary badges: 500+ points

## Rarity Levels

1. **Common** - Easy to earn, basic achievements
2. **Rare** - Moderate difficulty, consistent activity
3. **Epic** - Difficult to earn, significant achievements
4. **Legendary** - Very rare, exceptional achievements

## Display Recommendations

### User Profile Page

```typescript
// Show earned badges
<BadgeShowcase badges={user.profile.badges} />
```

### Badge Gallery Page

```typescript
// Show all available badges
<BadgeGallery
  badges={allBadges}
  earnedBadges={userBadges}
  showProgress={true}
/>
```

### Badge Notification

```typescript
// Show toast when badge is earned
onBadgeEarned={(badge) => {
  toast.success(`🎉 You earned: ${badge.name}!`);
}}
```

## Next Steps

1. ✅ Module created
2. ⏳ Add to main routes
3. ⏳ Seed default badges
4. ⏳ Integrate with User Profile
5. ⏳ Add auto-award triggers
6. ⏳ Create badge showcase UI
7. ⏳ Add badge notification system
8. ⏳ Create admin badge management UI
9. ⏳ Add tests
