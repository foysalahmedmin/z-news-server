import { publish } from '../../events/event-publisher';

export const emitProfileUpdated = (userId: string) =>
  publish('user.verified', { userId, event: 'profile_updated' });

export const emitReputationChanged = (
  userId: string,
  points: number,
  reason: string,
) =>
  publish('user.verified', {
    userId,
    points,
    reason,
    event: 'reputation_changed',
  });

export const emitBadgeEarned = (userId: string, badgeId: string) =>
  publish('user.verified', { userId, badgeId, event: 'badge_earned' });
