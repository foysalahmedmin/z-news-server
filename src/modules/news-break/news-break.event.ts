import { publish } from '../../events/event-publisher';

export const emitNewsBreakPublished = (breakId: string, newsId: string) =>
  publish('news.published', { breakId, newsId, type: 'breaking' });

export const emitNewsBreakArchived = (breakId: string) =>
  publish('news.archived', { breakId, type: 'breaking' });
