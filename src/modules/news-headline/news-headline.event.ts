import { publish } from '../../events/event-publisher';

export const emitNewsHeadlinePublished = (headlineId: string, newsId: string) =>
  publish('news.published', { headlineId, newsId, type: 'headline' });

export const emitNewsHeadlineArchived = (headlineId: string) =>
  publish('news.archived', { headlineId, type: 'headline' });
