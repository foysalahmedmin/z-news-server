export enum CommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
}

export enum CommentSortOrder {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  TOP_RATED = 'top_rated',
  MOST_REPLIED = 'most_replied',
}

export enum CommentModerationAction {
  APPROVE = 'approve',
  REJECT = 'reject',
  FLAG = 'flag',
  PIN = 'pin',
  UNPIN = 'unpin',
}
