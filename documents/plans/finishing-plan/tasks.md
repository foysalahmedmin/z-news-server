# Finishing Tasks — Z-News Backend

## Phase 1 — Critical Bugs ✅

- [x] Fix auth middleware role check: `||` → `&&` in `auth.middleware.ts`
- [x] Invalidate password reset token after use in `auth.service.ts`
- [x] Validate file deletion path against uploads directory in `news.controller.ts`

## Phase 2 — Security ✅

- [x] Add auth middleware to poll vote endpoint
- [x] Add rate limiter to `POST /api/auth/forget-password`
- [x] Add guest token expiration validation in `guest.service.ts`
- [x] Add RBAC check for workflow assignee in `workflow.service.ts`
- [x] Add MIME type validation at service layer in `file.service.ts`
- [x] Audit all admin-only routes for proper auth guards

## Phase 3 — Remaining Major Gaps

### Business Logic

- [x] Workflow rejection → revert news to `draft` + notify author (`workflow.service.ts`)
- [x] Poll vote duplicate prevention + result percentage calculation (`poll.service.ts`)

### Architecture

- [x] Scheduler: run only on cluster worker 0 to prevent race condition (`scheduler.job.ts`)
- [x] Move CORS middleware before all others in `app.ts`

### API Consistency

- [x] Standardize list endpoints: `getAllPolls` + `getMyBookmarks` return `{ data, meta }`

### Notification

- [x] Check `notification_preferences` before sending each notification (`notification.service.ts`)

## Phase 4 — Testing

- [x] Fix all failing unit tests — 48 suites, 402 tests passing
- [x] Integration test: auth flow (`auth-flow.spec.ts` — 9 tests)
- [x] Integration test: news lifecycle (`news-flow.spec.ts` — 9 tests)
- [x] Integration test: editorial workflow (`editorial-workflow.spec.ts` — 8 tests)
- [x] Validator audit: 7 validator files completed
- [ ] Integration test: notification flow

---

## Completed Summary (as of 2026-05-03)

### Phase 1 — All 3 done

- Auth middleware `||` → `&&` role check corrected
- Password reset token nullified after use
- File path traversal validated

### Phase 2 — All 6 done

- Poll vote: auth + guest middleware, anonymous via `poll.allow_anonymous`
- Forget-password rate limiter applied
- Guest token expiration validated
- Workflow RBAC assignee check added
- MIME type service-layer validation added
- Admin route audit complete

### Phase 5 (partial, now merged into Phase 3 above)

- Logout: refresh token blacklisted in Redis ✅
- Slug uniqueness: single-query `ensureUniqueSlug` ✅

### Phase 7 — Testing infrastructure

- @swc/jest migration (faster, lower memory)
- `tsconfig.test.json` for IDE Jest support
- `src/__mocks__/@google-cloud/storage.ts`
- `src/test-setup.ts` for env vars injection
- **Final state: 48 suites / 402 tests — all passing**
