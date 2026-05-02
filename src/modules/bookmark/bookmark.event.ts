import { publish } from '../../events/event-publisher';

export const emitBookmarkCreated = (
  bookmarkId: string,
  newsId: string,
  userId: string,
) =>
  publish('news.published', { bookmarkId, newsId, userId, type: 'bookmarked' });

export const emitBookmarkRemoved = (
  bookmarkId: string,
  newsId: string,
  userId: string,
) =>
  publish('news.archived', {
    bookmarkId,
    newsId,
    userId,
    type: 'bookmark_removed',
  });

export const emitBookmarkRead = (bookmarkId: string, userId: string) =>
  publish('news.published', { bookmarkId, userId, type: 'bookmark_read' });
