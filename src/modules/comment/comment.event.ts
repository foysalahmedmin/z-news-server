import { publish } from '../../events/event-publisher';

export const emitCommentCreated = (
  commentId: string,
  newsId: string,
  userId?: string,
) => publish('comment.created', { commentId, newsId, userId });

export const emitCommentReply = (
  commentId: string,
  parentCommentId: string,
  userId?: string,
) =>
  publish('comment.created', {
    commentId,
    parentCommentId,
    userId,
    type: 'reply',
  });
