# Z-News Backend — Finishing Plan

**Analysis Date:** 2026-05-02  
**Last Updated:** 2026-05-03  
**Project State:** ~82% production-ready

---

## What Is Already Done

### Phase 1 — Critical Bugs ✅

- Auth middleware role check fixed (`||` → `&&`)
- Password reset token invalidated after use
- File deletion path traversal prevented

### Phase 2 — Security ✅

- Poll vote protected with auth + guest middleware
- Forget-password rate limited (5 req / 15 min)
- Guest token expiration validated
- Workflow assignee RBAC check added
- MIME type validated at service layer
- All admin-only routes audited and guarded

### Phase 5 (partial) ✅

- `POST /api/auth/logout` — refresh token blacklisted in Redis
- `ensureUniqueSlug` — single-query approach, replaces infinite loop

### Phase 7 — Testing ✅

- All 48 test suites passing (402 tests)
- 3 integration test suites added (auth, news, editorial workflow)
- @swc/jest migration for faster, lower-memory test runs
- 7 validator files completed with missing operation schemas

---

## What Remains — 6 Focused Tasks

These are the only remaining tasks. Chosen because they are **functional gaps** — the backend works but these are either broken, inconsistent, or incomplete in a way visible to API consumers.

---

### 1. Workflow Rejection State Machine

**File:** `src/modules/workflow/workflow.service.ts`  
**Problem:** Rejecting a workflow stage does nothing to the news article — it stays in whatever status it had. Author is not notified.  
**Fix:**

- On stage `status = 'rejected'`: set `news.status = 'draft'`
- Create a notification to the news author with the rejection reason

---

### 2. Poll Vote Duplicate Prevention + Result Calculation

**File:** `src/modules/poll/poll.service.ts`  
**Problem:** A user can vote multiple times. `GET /api/poll/:id/results` returns raw counts without percentages.  
**Fix:**

- Before recording vote: check if `user._id` already exists in `votes[]` array → return conflict error
- Result calculation: `percentage = (option.vote_count / total_votes) * 100`

---

### 3. Scheduler Race Condition

**File:** `src/modules/scheduler/scheduler.job.ts`  
**Problem:** In cluster mode all workers run the scheduler simultaneously — same news articles get published multiple times in parallel.  
**Fix:** Guard with `if (process.env.NODE_APP_INSTANCE !== '0') return;` at the top of the job

---

### 4. CORS Middleware Order

**File:** `src/app.ts`  
**Problem:** CORS middleware is applied after sanitize/session middleware — preflight `OPTIONS` requests can fail in production before CORS headers are set.  
**Fix:** Move `app.use(cors(...))` to be the first middleware registered

---

### 5. Pagination Consistency

**Problem:** Some list endpoints return plain arrays, others return `{ data, meta }`. API consumers can't rely on a consistent shape.  
**Fix:** All list endpoints must return:

```json
{
  "success": true,
  "data": [],
  "meta": { "total": 0, "page": 1, "limit": 10, "totalPages": 0 }
}
```

Modules to audit: `notification`, `bookmark`, `comment`, `view`, `badge`

---

### 6. Notification Preferences Check

**File:** `src/modules/notification/notification.service.ts`  
**Problem:** Notifications are sent regardless of user's `notification_preferences` settings.  
**Fix:** Before creating a notification, fetch the recipient's profile and check `notification_preferences` — skip channels the user has disabled

---

## Dropped Tasks

The following were in the original plan but removed to keep scope focused on real gaps:

| Dropped                         | Reason                                |
| ------------------------------- | ------------------------------------- |
| Badge auto-award engine         | Complex new system, not a gap         |
| View analytics endpoints        | New feature, not a gap                |
| Reading streak logic            | New feature, not a gap                |
| Comment reply depth limit       | Edge case, not blocking               |
| Service → repository refactors  | Internal architecture, no user impact |
| Cache invalidation refinement   | Optimization, not a gap               |
| File cleanup on entity delete   | Nice to have                          |
| MongoDB text search             | New feature                           |
| Email verification flow verify  | Already works, just unverified        |
| MongoDB transaction on workflow | Optimization                          |

---
