export enum NewsStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum NewsContentType {
  ARTICLE = 'article',
  VIDEO = 'video',
  PODCAST = 'podcast',
  LIVE_BLOG = 'live-blog',
  PHOTO_ESSAY = 'photo-essay',
}

export enum NewsSensitivityLevel {
  PUBLIC = 'public',
  SENSITIVE = 'sensitive',
  RESTRICTED = 'restricted',
}
