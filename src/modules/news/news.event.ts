import { publish } from '../../events/event-publisher';

export const emitNewsCreated = (newsId: string, authorId: string) =>
  publish('news.created', { newsId, authorId });

export const emitNewsPublished = (newsId: string) =>
  publish('news.published', { newsId });

export const emitNewsArchived = (newsId: string) =>
  publish('news.archived', { newsId });

export const emitNewsDeleted = (newsId: string, deletedBy: string) =>
  publish('news.deleted', { newsId, deletedBy });
