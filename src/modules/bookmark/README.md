# Bookmarks & Reading Lists Module

## Overview

Complete bookmark and reading list system for saving and organizing articles.

## Features

- ✅ Save articles for later reading
- ✅ Add personal notes to bookmarks
- ✅ Mark articles as read/unread
- ✅ Create custom reading lists
- ✅ Organize bookmarks into lists
- ✅ Public/private reading lists
- ✅ Share reading lists
- ✅ Follow other users' public lists
- ✅ Offline reading support (via bookmarks)

## Files Created

1. `bookmark.type.ts` - TypeScript type definitions
2. `bookmark.model.ts` - Mongoose schemas for Bookmark and ReadingList
3. `bookmark.validation.ts` - Zod validation schemas
4. `bookmark.service.ts` - Business logic
5. `bookmark.controller.ts` - Request handlers
6. `bookmark.route.ts` - API routes

## API Endpoints

### Bookmark Endpoints

#### POST /api/bookmark

Create a bookmark

- **Auth:** Required
- **Body:** `{ news, reading_list?, notes? }`
- **Response:** Created bookmark

#### GET /api/bookmark?is_read=false&reading_list=123

Get my bookmarks

- **Auth:** Required
- **Query:** `is_read` (boolean), `reading_list` (ID)
- **Response:** Array of bookmarks

#### GET /api/bookmark/:bookmarkId

Get bookmark by ID

- **Auth:** Required (owner only)
- **Response:** Bookmark details

#### PATCH /api/bookmark/:bookmarkId

Update bookmark

- **Auth:** Required (owner only)
- **Body:** `{ notes?, is_read? }`
- **Response:** Updated bookmark

#### PATCH /api/bookmark/:bookmarkId/move

Move bookmark to reading list

- **Auth:** Required (owner only)
- **Body:** `{ reading_list_id }`
- **Response:** Updated bookmark

#### DELETE /api/bookmark/:bookmarkId

Delete bookmark

- **Auth:** Required (owner only)
- **Response:** Success message

### Reading List Endpoints

#### POST /api/bookmark/reading-list

Create reading list

- **Auth:** Required
- **Body:** `{ name, description?, is_public? }`
- **Response:** Created reading list

#### GET /api/bookmark/reading-list/my

Get my reading lists

- **Auth:** Required
- **Response:** Array of reading lists with bookmarks

#### GET /api/bookmark/reading-list/public?limit=20

Get public reading lists

- **Auth:** Public
- **Query:** `limit` (default: 20)
- **Response:** Array of public reading lists

#### GET /api/bookmark/reading-list/:listId

Get reading list by ID

- **Auth:** Public (if public) or Owner
- **Response:** Reading list with bookmarks

#### PATCH /api/bookmark/reading-list/:listId

Update reading list

- **Auth:** Required (owner only)
- **Body:** `{ name?, description?, is_public? }`
- **Response:** Updated reading list

#### DELETE /api/bookmark/reading-list/:listId

Delete reading list

- **Auth:** Required (owner only)
- **Response:** Success message

#### POST /api/bookmark/reading-list/:listId/follow

Follow a public reading list

- **Auth:** Required
- **Response:** Updated reading list

#### DELETE /api/bookmark/reading-list/:listId/follow

Unfollow a reading list

- **Auth:** Required
- **Response:** Updated reading list

## Database Schemas

### Bookmark Schema

```typescript
{
  user: ObjectId (ref: User),
  news: ObjectId (ref: News),
  reading_list: ObjectId (ref: ReadingList),
  notes: String (max 1000),
  is_read: Boolean (default: false),
  read_at: Date,
  is_deleted: Boolean,
  created_at: Date,
  updated_at: Date
}
```

### Reading List Schema

```typescript
{
  user: ObjectId (ref: User),
  name: String (max 100, required),
  description: String (max 500),
  is_public: Boolean (default: false),
  bookmarks: [ObjectId (ref: Bookmark)],
  followers: [ObjectId (ref: User)],
  is_deleted: Boolean,
  created_at: Date,
  updated_at: Date
}
```

## Indexes

### Bookmark Indexes

- `user + news` (unique compound index)
- `user + is_read`
- `reading_list`
- `created_at` (descending)

### Reading List Indexes

- `user`
- `is_public`
- `created_at` (descending)

## Use Cases

### 1. Save Article for Later

```typescript
POST /api/bookmark
{
  "news": "article_id",
  "notes": "Read this on weekend"
}
```

### 2. Create Reading List

```typescript
POST /api/bookmark/reading-list
{
  "name": "Tech News",
  "description": "My favorite tech articles",
  "is_public": true
}
```

### 3. Organize Bookmarks

```typescript
PATCH /api/bookmark/bookmark_id/move
{
  "reading_list_id": "list_id"
}
```

### 4. Mark as Read

```typescript
PATCH /api/bookmark/bookmark_id
{
  "is_read": true
}
```

### 5. Follow Public List

```typescript
POST / api / bookmark / reading - list / list_id / follow;
```

## Integration Points

### 1. Add bookmark button to article page

```typescript
// In news detail page
<BookmarkButton newsId={article._id} />
```

### 2. Show bookmark count on articles

```typescript
// Add virtual field to News model
newsSchema.virtual('bookmark_count', {
  ref: 'Bookmark',
  localField: '_id',
  foreignField: 'news',
  count: true,
  match: { is_deleted: { $ne: true } },
});
```

### 3. Personalized recommendations

```typescript
// Use bookmarks to improve recommendations
const userBookmarks = await Bookmark.find({ user: userId }).populate(
  'news',
  'category tags',
);
// Recommend similar articles
```

## Features to Add Later

- [ ] Bulk bookmark operations
- [ ] Export bookmarks (JSON, CSV)
- [ ] Import bookmarks from other platforms
- [ ] Bookmark tags/labels
- [ ] Search within bookmarks
- [ ] Bookmark analytics (most bookmarked articles)
- [ ] Email digest of unread bookmarks
- [ ] Browser extension integration

## Next Steps

1. ✅ Module created
2. ⏳ Add to main routes
3. ⏳ Create website UI components
4. ⏳ Add bookmark button to article pages
5. ⏳ Create reading list pages
6. ⏳ Add tests
