import { publish } from '../../events/event-publisher';

export const emitEventCreated = (eventId: string, createdBy: string) =>
  publish('news.created', { eventId, createdBy, type: 'event_created' });

export const emitEventActivated = (eventId: string) =>
  publish('news.published', { eventId, type: 'event_activated' });

export const emitEventDeactivated = (eventId: string) =>
  publish('news.archived', { eventId, type: 'event_deactivated' });
