import { publish } from '../../events/event-publisher';

export const emitTemplateCreated = (templateId: string, createdBy: string) =>
  publish('news.created', { templateId, createdBy, type: 'template_created' });

export const emitTemplateUpdated = (templateId: string, updatedBy: string) =>
  publish('news.created', { templateId, updatedBy, type: 'template_updated' });

export const emitTemplateDeleted = (templateId: string, deletedBy: string) =>
  publish('news.deleted', { templateId, deletedBy, type: 'template_deleted' });
