export enum ArticleVersionChangeType {
  INITIAL = 'initial',
  CONTENT_EDIT = 'content_edit',
  METADATA_EDIT = 'metadata_edit',
  AUTO_SAVE = 'auto_save',
  RESTORE = 'restore',
}

export enum ArticleVersionDiffField {
  TITLE = 'title',
  SUB_TITLE = 'sub_title',
  DESCRIPTION = 'description',
  CONTENT = 'content',
  TAGS = 'tags',
  CATEGORY = 'category',
  THUMBNAIL = 'thumbnail',
}
