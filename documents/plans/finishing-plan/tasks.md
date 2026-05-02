# Finishing Tasks — Z-News Backend

## Phase 1 — Critical Bugs
- [ ] Fix auth middleware role check: `||` → `&&` in `auth.middleware.ts`
- [ ] Invalidate password reset token after use in `auth.service.ts`
- [ ] Validate file deletion path against uploads directory in `news.controller.ts`

## Phase 2 — Security
- [ ] Add auth middleware to poll vote endpoint
- [ ] Add rate limiter to `POST /api/auth/forget-password`
- [ ] Add guest token expiration validation in `guest.service.ts`
- [ ] Add RBAC check for workflow assignee in `workflow.service.ts`
- [ ] Add MIME type validation at service layer in `file.service.ts`
- [ ] Audit all admin-only routes for proper auth guards

## Phase 3 — Business Logic
- [ ] Workflow rejection → revert news to `draft` + notify author
- [ ] Badge auto-award criteria engine (comment/reaction/news count triggers)
- [ ] Poll vote duplicate prevention + result percentage calculation
- [ ] Wire email sending in notification service when `channels` includes `'email'`
- [ ] View analytics: `getTopViewedNews`, `getViewTrends`, `getTotalViewCount`
- [ ] Reading streak increment logic on article view
- [ ] MongoDB text index on news + expose `?search=` param
- [ ] Comment-enhanced reply depth limit (max 5 levels)

## Phase 4 — Architecture
- [ ] Refactor `notification.service.ts` to use `notification.repository.ts`
- [ ] Refactor `notification-recipient.service.ts` to use its repository
- [ ] Refactor `bookmark.service.ts` to use `bookmark.repository.ts`
- [ ] Scheduler: run only on cluster worker 0 to prevent race condition
- [ ] Wrap workflow approve/reject in MongoDB transaction
- [ ] Refine cache invalidation patterns (specific keys, not wildcard)
- [ ] Move CORS middleware before all others in `app.ts`

## Phase 5 — Missing Features
- [ ] Implement `POST /api/auth/logout` with refresh token blacklisting
- [ ] Verify end-to-end email verification flow
- [ ] Check `notification_preferences` before sending each notification
- [ ] Auto-regenerate slug on news title update + uniqueness check
- [ ] File cleanup on entity delete (disk + GCS)
- [ ] Standardize all list endpoints to return `{ data, meta: { total, page, limit, totalPages } }`

## Phase 6 — API Gaps
- [ ] `GET /api/view/top-viewed` endpoint
- [ ] `GET /api/news/:id/analytics` (views over time)
- [ ] `GET /api/poll/:id/results` — complete result calculation
- [ ] `GET /api/badge/progress` — user badge progress
- [ ] `GET /api/user-profile/streak` — reading streak info

## Phase 7 — Testing
- [ ] Run `pnpm test` and fix all failing unit tests
- [ ] Add E2E test: full auth flow
- [ ] Add E2E test: news lifecycle (draft → published → archived)
- [ ] Add E2E test: notification flow
- [ ] Audit and complete `poll.validator.ts`, `workflow.validator.ts`, `media.validator.ts`
