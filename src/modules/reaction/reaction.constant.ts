export const REACTION_CACHE_PREFIX = 'reaction';
export const REACTION_CACHE_TTL = 300; // 5 minutes
export const REACTION_COUNT_CACHE_TTL = 60; // 1 minute for counts
export const REACTION_DEFAULT_PAGE_LIMIT = 20;
export const REACTION_TYPES = [
  'like',
  'dislike',
  'insightful',
  'funny',
  'disagree',
] as const;
export const REACTION_GUEST_DAILY_LIMIT = 100;
