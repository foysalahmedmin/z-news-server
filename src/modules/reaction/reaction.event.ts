import { publish } from '../../events/event-publisher';

export const emitReactionCreated = (
  reactionId: string,
  newsId: string,
  reactionType: string,
  userId?: string,
) => publish('reaction.created', { reactionId, newsId, reactionType, userId });

export const emitReactionRemoved = (
  reactionId: string,
  newsId: string,
  userId?: string,
) =>
  publish('reaction.created', { reactionId, newsId, userId, type: 'removed' });
