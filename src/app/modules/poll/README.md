# Poll & Survey System

## Overview

Complete polling and survey system with voting, real-time results, and analytics.

## Features

- ✅ Create standalone or news-attached polls
- ✅ Multiple voting options (2-10 options)
- ✅ Single or multiple choice polls
- ✅ Anonymous voting support
- ✅ Scheduled polls (start/end dates)
- ✅ Real-time results with percentages
- ✅ Vote tracking and analytics
- ✅ Featured polls
- ✅ Poll categories and tags
- ✅ Randomize options to reduce bias
- ✅ Show/hide results before voting

## Files Created

1. `poll.type.ts` - TypeScript type definitions
2. `poll.model.ts` - Mongoose schema and model
3. `poll.validation.ts` - Zod validation schemas
4. `poll.service.ts` - Business logic with voting
5. `poll.controller.ts` - Request handlers
6. `poll.route.ts` - API routes

## API Endpoints

### POST /api/poll

Create a new poll

- **Auth:** Required
- **Body:** `{ title, description, options[], settings }`
- **Response:** Created poll

### GET /api/poll

Get all polls

- **Auth:** Public
- **Query:** `is_active`, `is_featured`, `category`, `tags`, `status`
- **Response:** Array of polls

### GET /api/poll/active

Get active polls

- **Auth:** Public
- **Response:** Array of active polls

### GET /api/poll/featured?limit=5

Get featured polls

- **Auth:** Public
- **Query:** `limit` (default: 5)
- **Response:** Array of featured polls

### GET /api/poll/news/:newsId

Get polls attached to a news article

- **Auth:** Public
- **Response:** Array of polls

### GET /api/poll/:pollId

Get poll by ID

- **Auth:** Public
- **Response:** Poll details with `has_voted` flag

### PATCH /api/poll/:pollId

Update poll

- **Auth:** Required (Creator or Admin)
- **Body:** Partial poll data
- **Response:** Updated poll
- **Note:** Cannot update options after voting starts

### POST /api/poll/:pollId/vote

Vote on a poll

- **Auth:** Optional (based on poll settings)
- **Body:** `{ option_indices: [0, 2], guest_id? }`
- **Response:** Updated poll with results

### GET /api/poll/:pollId/results

Get poll results

- **Auth:** Public
- **Response:** Results with percentages

### DELETE /api/poll/:pollId

Delete poll

- **Auth:** Required (Creator or Admin)
- **Response:** Success message

## Database Schema

```typescript
{
  news: ObjectId (ref: News, optional),
  created_by: ObjectId (ref: User, required),
  title: String (required, max 200),
  description: String (max 1000),
  options: [{
    text: String (required, max 200),
    votes: Number (default: 0),
    voters: [ObjectId (ref: User)]
  }],

  // Settings
  allow_multiple_votes: Boolean (default: false),
  max_votes: Number (default: 1),
  allow_anonymous: Boolean (default: false),
  show_results_before_vote: Boolean (default: true),
  randomize_options: Boolean (default: false),

  // Timing
  start_date: Date (default: now),
  end_date: Date (optional),
  is_active: Boolean (default: true),

  // Tracking
  total_votes: Number (default: 0),
  unique_voters: Number (default: 0),
  votes: [{
    user: ObjectId,
    guest_id: String,
    option_index: Number,
    voted_at: Date
  }],

  // Metadata
  tags: [String],
  category: ObjectId (ref: Category),
  is_featured: Boolean (default: false),
  is_deleted: Boolean,
  created_at: Date,
  updated_at: Date
}
```

## Virtual Fields

### `status`

Returns poll status: 'scheduled', 'active', 'ended', 'inactive'

### `results`

Returns array of results with percentages:

```typescript
[
  { text: 'Option 1', votes: 45, percentage: '45.00' },
  { text: 'Option 2', votes: 55, percentage: '55.00' },
];
```

## Indexes

- `{ created_by: 1 }`
- `{ news: 1 }`
- `{ is_active: 1, end_date: 1 }`
- `{ is_featured: 1, created_at: -1 }`
- `{ tags: 1 }`
- `{ created_at: -1 }`

## Use Cases

### 1. Create Simple Poll

```typescript
POST /api/poll
{
  "title": "What's your favorite programming language?",
  "options": [
    { "text": "JavaScript" },
    { "text": "Python" },
    { "text": "TypeScript" },
    { "text": "Go" }
  ]
}
```

### 2. Create Multiple Choice Poll

```typescript
POST /api/poll
{
  "title": "Which features do you want next?",
  "options": [
    { "text": "Dark Mode" },
    { "text": "Mobile App" },
    { "text": "API Access" },
    { "text": "Advanced Analytics" }
  ],
  "allow_multiple_votes": true,
  "max_votes": 2
}
```

### 3. Create Scheduled Poll

```typescript
POST /api/poll
{
  "title": "Election Poll 2024",
  "options": [...],
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-12-31T23:59:59Z"
}
```

### 4. Create Anonymous Poll

```typescript
POST /api/poll
{
  "title": "Salary Survey",
  "options": [...],
  "allow_anonymous": true,
  "show_results_before_vote": false
}
```

### 5. Vote on Poll

```typescript
POST /api/poll/poll_id/vote
{
  "option_indices": [0]  // Vote for first option
}

// Multiple choice
{
  "option_indices": [0, 2]  // Vote for first and third options
}

// Anonymous vote
{
  "option_indices": [1],
  "guest_id": "unique_guest_identifier"
}
```

## Voting Rules

1. **Single Vote:** User can vote only once per poll
2. **Multiple Choice:** If enabled, user can select up to `max_votes` options
3. **Anonymous:** If enabled, non-authenticated users can vote with guest_id
4. **Time-based:** Poll must be active and within start/end dates
5. **No Changes:** Options cannot be modified after voting starts

## Integration Points

### 1. Attach Poll to News Article

```typescript
// In news detail page
const poll = await PollService.createPoll(userId, {
  news: newsId,
  title: 'What do you think about this article?',
  options: [
    { text: 'Very informative' },
    { text: 'Somewhat useful' },
    { text: 'Not helpful' },
  ],
});
```

### 2. Display Poll Results

```typescript
// Real-time results
const results = await PollService.getPollResults(pollId);

// Display
results.results.forEach((result) => {
  console.log(`${result.text}: ${result.votes} (${result.percentage}%)`);
});
```

### 3. Featured Polls Widget

```typescript
// Homepage sidebar
const featuredPolls = await PollService.getFeaturedPolls(3);
```

## Analytics

Track poll performance:

- Total votes
- Unique voters
- Vote distribution
- Voting timeline
- User demographics (if authenticated)

## Features to Add Later

- [ ] Poll templates
- [ ] Export results (CSV, PDF)
- [ ] Poll sharing on social media
- [ ] Email notifications for new polls
- [ ] Poll analytics dashboard
- [ ] A/B testing for poll options
- [ ] Poll embedding in external sites
- [ ] Advanced filtering and search

## Next Steps

1. ✅ Module created
2. ⏳ Add to main routes
3. ⏳ Create poll widget UI
4. ⏳ Add poll to news article editor
5. ⏳ Create results visualization
6. ⏳ Add real-time updates (Socket.io)
7. ⏳ Add tests
