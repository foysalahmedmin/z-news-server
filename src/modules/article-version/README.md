# Article Version Module

## Overview

Complete implementation of the Article Versioning System for Z-News platform.

## Features

- ✅ Automatic version creation on article updates
- ✅ Complete content and metadata snapshots
- ✅ Version comparison (diff)
- ✅ One-click version restoration
- ✅ Version history timeline
- ✅ Soft delete support
- ✅ RBAC protection

## Files Created

1. `article-version.type.ts` - TypeScript type definitions
2. `article-version.model.ts` - Mongoose schema and model
3. `article-version.validation.ts` - Zod validation schemas
4. `article-version.service.ts` - Business logic
5. `article-version.controller.ts` - Request handlers
6. `article-version.route.ts` - API routes

## API Endpoints

### GET /api/article-version/news/:newsId

Get all versions for a news article

- **Auth:** super-admin, admin, editor, author
- **Response:** Array of versions sorted by version_number (descending)

### GET /api/article-version/:versionId

Get a specific version by ID

- **Auth:** super-admin, admin, editor, author
- **Response:** Version details with populated changed_by user

### GET /api/article-version/news/:newsId/compare?version1=1&version2=2

Compare two versions

- **Auth:** super-admin, admin, editor, author
- **Query Params:** version1, version2 (version numbers)
- **Response:** Side-by-side comparison of both versions

### POST /api/article-version/:versionId/restore

Restore a specific version

- **Auth:** super-admin, admin, editor
- **Action:** Creates new version before restoring, then updates news article
- **Response:** Updated news article

### DELETE /api/article-version/:versionId

Soft delete a version

- **Auth:** super-admin, admin
- **Response:** Success message

## Integration Required

### 1. Add to routes/index.ts

```typescript
import { ArticleVersionRoutes } from '../modules/article-version/article-version.route';

// Add to routes array
{
  path: '/article-version',
  route: ArticleVersionRoutes,
}
```

### 2. Update News Service

Add automatic version creation when news is updated:

```typescript
// In news.service.ts updateNews function
import { ArticleVersionService } from '../article-version/article-version.service';

// Before updating news
await ArticleVersionService.createVersion(newsId, userId, 'Article updated');
```

## Database Schema

```typescript
{
  news: ObjectId (ref: News),
  version_number: Number,
  content_snapshot: String,
  metadata_snapshot: {
    title: String,
    sub_title: String,
    description: String,
    tags: [String],
    category: ObjectId,
    categories: [ObjectId],
    thumbnail: ObjectId,
    video: ObjectId,
    youtube: String
  },
  changed_by: ObjectId (ref: User),
  change_summary: String,
  diff: {
    added: [String],
    removed: [String],
    modified: [String]
  },
  is_deleted: Boolean,
  created_at: Date,
  updated_at: Date
}
```

## Indexes

- `news + version_number` (unique compound index)
- `news` (for quick lookups)
- `created_at` (for sorting)
- `changed_by` (for user activity)

## Next Steps

1. ✅ Module created
2. ⏳ Add to main routes
3. ⏳ Integrate with News service
4. ⏳ Create admin panel UI
5. ⏳ Add diff visualization library
6. ⏳ Add tests
