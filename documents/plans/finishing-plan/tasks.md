# Finishing Tasks — Z-News Backend

## Phase 1 — Critical Bugs
- [x] Fix auth middleware role check: `||` → `&&` in `auth.middleware.ts`
- [x] Invalidate password reset token after use in `auth.service.ts`
- [x] Validate file deletion path against uploads directory in `news.controller.ts`

## Phase 2 — Security
- [x] Add auth middleware to poll vote endpoint
- [x] Add rate limiter to `POST /api/auth/forget-password`
- [x] Add guest token expiration validation in `guest.service.ts`
- [x] Add RBAC check for workflow assignee in `workflow.service.ts`
- [x] Add MIME type validation at service layer in `file.service.ts`
- [x] Audit all admin-only routes for proper auth guards

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
- [x] Implement `POST /api/auth/logout` with refresh token blacklisting
- [ ] Verify end-to-end email verification flow
- [ ] Check `notification_preferences` before sending each notification
- [x] Auto-regenerate slug on news title update + uniqueness check
- [ ] File cleanup on entity delete (disk + GCS)
- [ ] Standardize all list endpoints to return `{ data, meta: { total, page, limit, totalPages } }`

## Phase 6 — API Gaps
- [ ] `GET /api/view/top-viewed` endpoint
- [ ] `GET /api/news/:id/analytics` (views over time)
- [ ] `GET /api/poll/:id/results` — complete result calculation
- [ ] `GET /api/badge/progress` — user badge progress
- [ ] `GET /api/user-profile/streak` — reading streak info

## Phase 7 — Testing
- [x] Run `pnpm test` and fix all failing unit tests
- [x] Add integration test: full auth flow (`auth-flow.spec.ts` — 9 tests)
- [x] Add integration test: news lifecycle (`news-flow.spec.ts` — 9 tests)
- [x] Add integration test: editorial workflow (`editorial-workflow.spec.ts` — 8 tests)
- [ ] Add integration test: notification flow
- [x] Audit and complete validators: `poll.validator.ts`, `workflow.validator.ts`, `media.validator.ts`, `badge.validator.ts`, `bookmark.validator.ts`, `user-profile.validator.ts`, `article-version.validator.ts`

---

## Completed Summary (as of 2026-05-03)

### Phase 1 — All 3 tasks complete
- Auth middleware: `||` → `&&` role check corrected
- Password reset token: nullified after successful use
- File path traversal: validated against uploads directory

### Phase 2 — All 6 tasks complete
- Poll vote: auth + guest middleware applied, anonymous allowed via `poll.allow_anonymous`
- Forget-password rate limiter: applied via `forgetPasswordRateLimiter`
- Guest token expiration: validated in `guest.service.ts`
- Workflow RBAC assignee check: role validation added
- MIME type service-layer validation: added to `file.service.ts`
- Admin route audit: all sensitive routes confirmed guarded

### Phase 5 (partial)
- Logout: refresh token blacklisted in Redis
- Slug uniqueness: single-query `ensureUniqueSlug` with regex, replaces N+1 loop (OOM fix)

### Phase 7 (partial)
- All 45 existing unit test suites fixed and passing
- 3 new integration test suites written and passing (26 tests)
- Validator audit: 7 validator files updated with missing operation schemas
- Route audit: 7 route files updated to wire new validators
- Test infrastructure: migrated from ts-jest → @swc/jest (faster, lower memory)
- Added `tsconfig.test.json` for IDE Jest type support
- Added `src/__mocks__/@google-cloud/storage.ts` for GCS mocking
- Final state: **48 suites, 402 tests, all passing**
