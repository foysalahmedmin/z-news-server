export enum ReactionType {
  LIKE = 'like',
  DISLIKE = 'dislike',
  INSIGHTFUL = 'insightful',
  FUNNY = 'funny',
  DISAGREE = 'disagree',
}

export enum ReactionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum ReactionTarget {
  NEWS = 'news',
  COMMENT = 'comment',
}
