import { publish } from '../../events/event-publisher';

export const emitArticleVersionCreated = (
  versionId: string,
  newsId: string,
  changedBy: string,
) =>
  publish('news.created', {
    versionId,
    newsId,
    changedBy,
    type: 'version_created',
  });

export const emitArticleVersionRestored = (
  versionId: string,
  newsId: string,
  restoredBy: string,
) =>
  publish('news.created', {
    versionId,
    newsId,
    restoredBy,
    type: 'version_restored',
  });
