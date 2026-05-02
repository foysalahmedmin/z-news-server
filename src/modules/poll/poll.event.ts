import { publish } from '../../events/event-publisher';

export const emitPollCreated = (pollId: string, createdBy: string) =>
  publish('news.created', { pollId, createdBy, type: 'poll_created' });

export const emitPollVoteCast = (
  pollId: string,
  optionIndex: number,
  userId?: string,
  guestId?: string,
) =>
  publish('reaction.created', {
    pollId,
    optionIndex,
    userId,
    guestId,
    type: 'poll_vote',
  });

export const emitPollClosed = (pollId: string) =>
  publish('news.archived', { pollId, type: 'poll_closed' });
