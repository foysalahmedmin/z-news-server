import { publish } from '../../events/event-publisher';

export const emitBadgeCreated = (badgeId: string, createdBy: string) =>
  publish('news.created', { badgeId, createdBy, type: 'badge_created' });

export const emitBadgeAwarded = (badgeId: string, userId: string) =>
  publish('notification.sent', { badgeId, userId, type: 'badge_awarded' });
