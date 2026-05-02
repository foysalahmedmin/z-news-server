# Z-News Backend — Finishing Plan

**Analysis Date:** 2026-05-02  
**Analyst:** Senior Backend Review  
**Project State:** ~70% production-ready

---

## Executive Summary

The project has a solid architectural foundation — modular structure, repository pattern, Redis caching, Socket.io, JWT auth, soft-delete, pagination builder, RBAC policies. However, there are **1 critical bug**, **10 security vulnerabilities**, several incomplete business logic implementations, and an inconsistent repository pattern across modules. This plan defines the exact work needed to reach production quality.

---

## Phase 1 — Critical Bugs (Fix Before Anything Else)

### 1.1 Auth Middleware Role Check Bug
- **File:** `src/middlewares/auth.middleware.ts`
- **Bug:** Role check uses `||` (OR) instead of `&&` (AND), causing incorrect authorization
- **Fix:** Change the condition so access is denied unless the user's role is in the allowed roles list

### 1.2 Password Reset Token Not Invalidated After Use
- **File:** `src/modules/auth/auth.service.ts`
- **Bug:** After a password reset, the token remains valid and can be reused
- **Fix:** Set `password_reset_token = null` and `password_reset_expires = null` after successful reset

### 1.3 File Deletion Path Traversal Risk
- **File:** `src/modules/news/news.controller.ts`
- **Bug:** `deleteNewsFile(path)` accepts arbitrary path — potential directory traversal
- **Fix:** Validate that the path starts with the configured uploads directory before deletion

---

## Phase 2 — Security Hardening

### 2.1 Poll Voting — No Authentication
- **File:** `src/modules/poll/poll.route.ts`
- Vote endpoint has no auth middleware — open to bot abuse
- Add `auth()` middleware with `allow_anonymous` check from poll settings

### 2.2 Password Reset — Email Enumeration
- **File:** `src/modules/auth/auth.route.ts`
- No rate limiting on `POST /forget-password`
- Add per-IP rate limiter (5 requests / 15 min)

### 2.3 Guest Comment Token — No Expiration/Validation
- **File:** `src/modules/guest/guest.service.ts`
- Guest tokens stored as plain strings with no expiry check
- Add expiration validation when guest tokens are used

### 2.4 Workflow Assignee — No Permission Check
- **File:** `src/modules/workflow/workflow.service.ts`
- Any user can be assigned to a workflow stage without RBAC validation
- Check that the assignee has the required role before assignment

### 2.5 File Upload — No Service-Layer Mime Type Validation
- **File:** `src/modules/file/file.service.ts`
- MIME type validation only in route middleware — can be bypassed
- Add allowed MIME type check in the service layer as well

### 2.6 Unauthenticated Access to Sensitive Admin Endpoints
- Audit all admin-only routes across modules to confirm `auth(['super-admin', 'admin'])` is applied consistently
- Modules to audit: `notification`, `template`, `badge`, `workflow`, `article-version`

---

## Phase 3 — Incomplete Business Logic

### 3.1 Workflow Rejection State Machine
- **File:** `src/modules/workflow/workflow.service.ts`
- Rejection only marks stage as rejected with a comment
- **Missing:** Auto-revert news status back to `draft`, send rejection notification to author
- Implement: on rejection → `news.status = 'draft'`, emit notification to news author

### 3.2 Badge Auto-Award Logic
- **File:** `src/modules/badge/badge.service.ts`
- Badge awarding requires a criteria evaluation engine
- **Missing:** Condition checking (e.g., "award badge when user reaches 100 comments")
- Implement badge condition types: `comment_count`, `reaction_count`, `article_count`, `reputation_score`
- Hook into comment/reaction/news create events to auto-check and award

### 3.3 Poll Vote Logic — Duplicate Prevention & Result Aggregation
- **File:** `src/modules/poll/poll.service.ts`
- **Missing:** Duplicate vote check for authenticated users, anonymous fingerprinting
- Implement: Check `votes[]` array for existing `user._id` before allowing vote
- Result calculation: `percentage = (option.votes / total_votes) * 100`

### 3.4 Notification Email Delivery
- **File:** `src/modules/notification/notification.service.ts`
- Notifications are created and emitted via Socket.io but email channel is NOT implemented
- **Missing:** When `channels` includes `'email'`, actually call `sendEmail()`
- Wire `src/utils/send-email.ts` into notification creation when email channel is selected

### 3.5 View Analytics Endpoint
- **File:** `src/modules/view/view.service.ts`
- Views are tracked but no analytics query exists
- **Missing:** `getTopViewedNews(period)`, `getViewTrends(newsId)`, `getTotalViewCount(newsId)`

### 3.6 Reading Streak Tracking
- **File:** `src/modules/user-profile/user-profile.service.ts`
- `reading_streak` field exists but streak logic on view creation is incomplete
- Implement: On each article view, check `last_read_at` — if yesterday, increment streak; if today, no-op; if older, reset to 1

### 3.7 Article Full-Text Search
- **File:** `src/modules/news/news.service.ts`
- AppQueryFind `.search()` builder exists but news search only covers title/slug
- Add MongoDB text index on `title`, `content`, `tags`, `description` fields
- Expose `?search=` param on public news endpoint

### 3.8 Comment-Enhanced Reply Depth Limit
- **File:** `src/modules/comment/comment-enhanced.service.ts`
- No depth limit on nested replies — can go infinitely deep
- Implement max depth of 5 levels; return error if exceeded

---

## Phase 4 — Architectural Consistency

### 4.1 Standardize Repository Pattern (3 Modules)
- **Files:** `bookmark.service.ts`, `notification.service.ts`, `notification-recipient.service.ts`
- These services call Mongoose models directly instead of through repositories
- Repositories already created — update services to use them
- Priority: `notification.service.ts` first (most complex)

### 4.2 Scheduler Race Condition
- **File:** `src/modules/scheduler/scheduler.job.ts`
- In cluster mode (multiple workers), all workers run the scheduler → race condition on `updateMany`
- Fix: Use MongoDB's atomic `$set` with `status: { $in: ['scheduled', 'published'] }` guard, or run scheduler only on worker 1 (`process.env.NODE_APP_INSTANCE === '0'`)

### 4.3 Workflow + News Update — Missing Transaction
- **File:** `src/modules/workflow/workflow.service.ts`
- Workflow stage update and news status update are two separate DB operations — not atomic
- Fix: Use MongoDB session + `startTransaction()` for the approve/reject flow

### 4.4 Cache Invalidation — Over-Broad Patterns
- Several modules invalidate `'module:*'` on any update — too aggressive
- Refine to invalidate only specific cache keys (e.g., `user:${id}` instead of `user:*`)
- Modules affected: `user`, `category`, `news`, `notification`

### 4.5 Middleware Order in app.ts
- CORS middleware is applied after sanitize middleware
- Move CORS before all other middlewares to ensure preflight requests are handled first

---

## Phase 5 — Missing Features (Production Required)

### 5.1 Logout & Token Blacklisting
- **Missing endpoint:** `POST /api/auth/logout`
- On logout: add refresh token to Redis blacklist with TTL = token expiry
- Check blacklist in `auth.middleware.ts` before accepting refresh tokens

### 5.2 Email Verification Flow
- **File:** `src/modules/auth/auth.service.ts`
- Email verification token generation exists but actual email sending needs verification
- Test full flow: signup → email sent → user clicks link → `is_email_verified = true`

### 5.3 Notification Preferences Enforcement
- **File:** `src/modules/user-profile/user-profile.service.ts`
- `notification_preferences` field exists in user profile but never checked before sending notifications
- Before sending email/push notification, check `userProfile.notification_preferences`

### 5.4 News Slug Uniqueness on Update
- **File:** `src/modules/news/news.service.ts`
- On news title update, slug should be regenerated and must remain unique
- Add slug conflict check using counter suffix: `my-news-title-2`, `my-news-title-3`

### 5.5 File Cleanup on Entity Delete
- When a news article is deleted, its associated file/media references should be cleaned
- When a file is deleted from DB, delete the actual file from disk/GCS
- Hook soft-delete and hard-delete events to trigger cleanup

### 5.6 Pagination Consistency Across All Modules
- Some modules return `{ data, meta }`, others return arrays directly
- Standardize: ALL list endpoints return `{ success, message, data: [], meta: { total, page, limit, totalPages } }`

---

## Phase 6 — API Completeness Gaps

| Endpoint | Module | Status |
|---|---|---|
| `POST /api/auth/logout` | auth | Missing |
| `GET /api/news?search=keyword` | news | Partial (no text index) |
| `GET /api/news/:id/analytics` | view | Missing |
| `GET /api/view/top-viewed` | view | Missing |
| `GET /api/poll/:id/results` | poll | Needs completion |
| `POST /api/poll/:id/vote` | poll | Needs duplicate check |
| `PATCH /api/workflow/:id/reject` | workflow | Needs news status rollback |
| `GET /api/badge/progress` | badge | Missing |
| `POST /api/notification/send-email` | notification | Missing email trigger |
| `GET /api/user-profile/streak` | user-profile | Missing |

---

## Phase 7 — Testing & Quality

### 7.1 Fix Existing Test Stubs
- Many test files were generated as structural stubs — verify they actually test real behavior
- Run `pnpm test` and fix all failing tests

### 7.2 Integration Tests
- `tests/` folder is empty — add E2E tests for critical flows:
  - Full auth flow: signup → verify email → login → refresh → logout
  - News lifecycle: draft → pending → scheduled → published → archived
  - Notification flow: news published → notification created → socket emitted → email sent

### 7.3 Add Missing Validators
- Some modules have incomplete Zod schemas (missing required field validations, enum checks)
- Audit: `poll.validator.ts`, `workflow.validator.ts`, `media.validator.ts`

---

## Priority Order Summary

| Priority | Phase | Effort | Impact |
|---|---|---|---|
| 🔴 P0 | Phase 1 — Critical Bugs | 1 day | Prevents security breach |
| 🔴 P1 | Phase 2 — Security Hardening | 2–3 days | Production safety |
| 🟡 P2 | Phase 3 — Business Logic | 3–5 days | Feature completeness |
| 🟡 P3 | Phase 4 — Architecture | 2–3 days | Code quality |
| 🟢 P4 | Phase 5 — Missing Features | 3–4 days | Full product |
| 🟢 P5 | Phase 6 — API Gaps | 1–2 days | API completeness |
| 🟢 P6 | Phase 7 — Testing | 2–3 days | Reliability |

**Total estimated effort:** ~14–21 days of focused development

---

## What Is Already Production-Ready

- ✅ Full auth system (JWT access + refresh + Google OAuth)
- ✅ 7-role RBAC with permission matrix
- ✅ News full lifecycle (draft → publish → archive) with scheduler
- ✅ Redis caching with pattern-based invalidation
- ✅ Socket.io clustering with Redis adapter
- ✅ File upload (local + Google Cloud Storage)
- ✅ Soft-delete + restore + hard-delete across all models
- ✅ Paginated query builder (AppQueryFind)
- ✅ Comment system with guest support
- ✅ Bookmark + Reading List
- ✅ Category tree with graphLookup
- ✅ Article versioning/snapshots
- ✅ Workflow editorial pipeline
- ✅ Poll system
- ✅ Badge + Reputation system (partial)
- ✅ Node.js cluster mode with graceful shutdown
