import { publish } from '../../events/event-publisher';

export const emitViewRecorded = (
  newsId: string,
  userId?: string,
  guestId?: string,
) =>
  publish('news.published', { newsId, userId, guestId, type: 'view_recorded' });
