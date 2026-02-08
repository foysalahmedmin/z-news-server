# Z-News Phase 1 Modules - Integration Guide

## Overview

This guide explains how to integrate the newly created Phase 1 modules into the Z-News server.

## Created Modules

1. ✅ **Article Version** - Version control for articles
2. ✅ **User Profile** - User profiles with reputation system
3. ✅ **Bookmark** - Bookmarks and reading lists
4. ✅ **Badge** - Gamification and achievement system

---

## Step 1: Register Routes

### File: `src/app/routes/index.ts`

Add the new module routes to the routes array:

```typescript
import { ArticleVersionRoutes } from '../modules/article-version/article-version.route';
import { UserProfileRoutes } from '../modules/user-profile/user-profile.route';
import { BookmarkRoutes } from '../modules/bookmark/bookmark.route';
import { BadgeRoutes } from '../modules/badge/badge.route';

const routes = [
  // ... existing routes ...

  {
    path: '/article-version',
    route: ArticleVersionRoutes,
  },
  {
    path: '/user-profile',
    route: UserProfileRoutes,
  },
  {
    path: '/bookmark',
    route: BookmarkRoutes,
  },
  {
    path: '/badge',
    route: BadgeRoutes,
  },
];
```

---

## Step 2: Auto-Create User Profile on Registration

### File: `src/app/modules/auth/auth.service.ts`

Add profile creation after user registration:

```typescript
import { UserProfileService } from '../user-profile/user-profile.service';

// In the register function, after creating user:
const newUser = await User.create(userData);

// Create default user profile
await UserProfileService.createOrGetProfile(newUser._id.toString());

return newUser;
```

---

## Step 3: Auto-Create Article Versions on News Update

### File: `src/app/modules/news/news.service.ts`

Add version creation before updating news:

```typescript
import { ArticleVersionService } from '../article-version/article-version.service';

// In the updateNews function, before updating:
const updateNews = async (newsId: string, userId: string, payload: any) => {
  const news = await News.findById(newsId);

  if (!news) {
    throw new AppError(httpStatus.NOT_FOUND, 'News not found');
  }

  // Create version snapshot before update
  await ArticleVersionService.createVersion(newsId, userId, 'Article updated');

  // Continue with update...
  Object.assign(news, payload);
  await news.save();

  return news;
};
```

---

## Step 4: Track User Activity

### A. Track Article Reads

**File:** `src/app/modules/view/view.service.ts`

```typescript
import { UserProfile } from '../user-profile/user-profile.model';
import { UserProfileService } from '../user-profile/user-profile.service';
import { BadgeService } from '../badge/badge.service';

// In createView function, after creating view:
const createView = async (userId: string, newsId: string) => {
  // ... existing view creation logic ...

  // Track activity if user is authenticated
  if (userId) {
    await UserProfile.incrementActivityStat(userId, 'articles_read');
    await UserProfileService.updateReadingStreak(userId);

    // Check and award badges
    await BadgeService.checkAndAwardBadges(userId);
  }

  return view;
};
```

### B. Track Comments

**File:** `src/app/modules/comment/comment.service.ts`

```typescript
import { UserProfile } from '../user-profile/user-profile.model';
import { BadgeService } from '../badge/badge.service';

// In createComment function, after creating comment:
const createComment = async (userId: string, payload: any) => {
  // ... existing comment creation logic ...

  // Track activity
  await UserProfile.incrementActivityStat(userId, 'total_comments');

  // Check and award badges
  await BadgeService.checkAndAwardBadges(userId);

  return comment;
};
```

### C. Track Reactions

**File:** `src/app/modules/reaction/reaction.service.ts`

```typescript
import { UserProfile } from '../user-profile/user-profile.model';

// In createReaction function, after creating reaction:
const createReaction = async (userId: string, payload: any) => {
  // ... existing reaction creation logic ...

  // Track activity
  await UserProfile.incrementActivityStat(userId, 'total_reactions');

  return reaction;
};
```

---

## Step 5: Seed Default Badges on Server Start

### File: `src/server.ts` or `src/app.ts`

Add badge seeding on server startup:

```typescript
import { BadgeService } from './app/modules/badge/badge.service';

async function bootstrap() {
  try {
    // Connect to database
    await mongoose.connect(config.database_url);

    // Seed default badges (only creates if not exists)
    await BadgeService.seedDefaultBadges();
    console.log('✅ Default badges seeded');

    // Start server
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

bootstrap();
```

---

## Step 6: Update News Model (Optional - Enhanced Fields)

### File: `src/app/modules/news/news.model.ts`

Add new SEO and metadata fields to the News schema:

```typescript
const newsSchema = new Schema({
  // ... existing fields ...

  // SEO Enhancement
  meta_title: {
    type: String,
    trim: true,
    maxlength: [60, 'Meta title cannot exceed 60 characters'],
  },
  meta_description: {
    type: String,
    trim: true,
    maxlength: [160, 'Meta description cannot exceed 160 characters'],
  },
  canonical_url: {
    type: String,
    trim: true,
  },

  // Content Classification
  content_type: {
    type: String,
    enum: ['article', 'video', 'podcast', 'live-blog', 'photo-essay'],
    default: 'article',
  },
  reading_time: {
    type: Number, // in minutes
  },
  word_count: {
    type: Number,
  },

  // Editorial Metadata
  sensitivity_level: {
    type: String,
    enum: ['public', 'sensitive', 'restricted'],
    default: 'public',
  },
  fact_checked: {
    type: Boolean,
    default: false,
  },

  // Geographic Targeting
  geo_targeting: {
    countries: [String],
    regions: [String],
    cities: [String],
  },

  // Related Content
  related_articles: [
    {
      type: Schema.Types.ObjectId,
      ref: 'News',
    },
  ],

  // Performance Metrics
  avg_time_on_page: {
    type: Number,
  },
  bounce_rate: {
    type: Number,
  },
  share_count: {
    type: Number,
    default: 0,
  },
});

// Pre-save middleware to calculate reading time and word count
newsSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    // Calculate word count
    const words = this.content.split(/\s+/).length;
    this.word_count = words;

    // Calculate reading time (average 200 words per minute)
    this.reading_time = Math.ceil(words / 200);
  }
  next();
});
```

---

## Step 7: API Testing

### Test Article Versioning

```bash
# Get versions for an article
GET /api/article-version/news/{newsId}

# Compare two versions
GET /api/article-version/news/{newsId}/compare?version1=1&version2=2

# Restore a version
POST /api/article-version/{versionId}/restore
```

### Test User Profile

```bash
# Get my profile
GET /api/user-profile/me

# Update profile
PATCH /api/user-profile/me
{
  "bio": "Tech enthusiast and news reader",
  "location": "Dhaka, Bangladesh"
}

# Follow an author
POST /api/user-profile/follow/author
{
  "author_id": "author_id_here"
}
```

### Test Bookmarks

```bash
# Create bookmark
POST /api/bookmark
{
  "news": "news_id_here",
  "notes": "Read this later"
}

# Create reading list
POST /api/bookmark/reading-list
{
  "name": "Weekend Reads",
  "is_public": true
}

# Get my bookmarks
GET /api/bookmark
```

### Test Badges

```bash
# Seed default badges (Super Admin only)
POST /api/badge/seed

# Get all badges
GET /api/badge

# Check and award badges to user (Admin only)
POST /api/badge/award/{userId}
```

---

## Step 8: Database Indexes

Ensure all indexes are created. Run this in MongoDB:

```javascript
// Article Version indexes
db.articleversions.createIndex({ news: 1, version_number: -1 });
db.articleversions.createIndex(
  { news: 1, version_number: 1 },
  { unique: true },
);

// User Profile indexes
db.userprofiles.createIndex({ user: 1 }, { unique: true });
db.userprofiles.createIndex({ reputation_score: -1 });

// Bookmark indexes
db.bookmarks.createIndex({ user: 1, news: 1 }, { unique: true });
db.bookmarks.createIndex({ user: 1, is_read: 1 });

// Reading List indexes
db.readinglists.createIndex({ user: 1 });
db.readinglists.createIndex({ is_public: 1 });

// Badge indexes
db.badges.createIndex({ name: 1 }, { unique: true });
db.badges.createIndex({ category: 1 });
```

---

## Step 9: Environment Variables

No new environment variables required for these modules.

---

## Step 10: Verification Checklist

- [ ] All routes registered in `routes/index.ts`
- [ ] User profile auto-created on registration
- [ ] Article versions created on news update
- [ ] Activity tracking working (views, comments, reactions)
- [ ] Badges seeded successfully
- [ ] Auto-badge awarding working
- [ ] All API endpoints tested
- [ ] Database indexes created
- [ ] No TypeScript errors
- [ ] Server starts successfully

---

## Common Issues & Solutions

### Issue 1: "Module not found" error

**Solution:** Ensure all imports use correct relative paths

### Issue 2: Circular dependency warnings

**Solution:** Use dynamic imports or restructure service dependencies

### Issue 3: Badges not auto-awarding

**Solution:** Ensure `checkAndAwardBadges` is called after activity updates

### Issue 4: Version creation fails

**Solution:** Ensure user is authenticated and has proper permissions

---

## Next Steps

After integration:

1. Create admin panel UI for these modules
2. Create website UI components
3. Add comprehensive tests
4. Monitor performance and optimize queries
5. Add caching for frequently accessed data

---

## Support

For issues or questions, refer to individual module READMEs:

- `modules/article-version/README.md`
- `modules/user-profile/README.md`
- `modules/bookmark/README.md`
- `modules/badge/README.md`
