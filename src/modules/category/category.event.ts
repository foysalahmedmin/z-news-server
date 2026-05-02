import { publish } from '../../events/event-publisher';

export const emitCategoryCreated = (categoryId: string, createdBy: string) =>
  publish('news.created', { categoryId, createdBy, type: 'category_created' });

export const emitCategoryUpdated = (categoryId: string, updatedBy: string) =>
  publish('news.created', { categoryId, updatedBy, type: 'category_updated' });

export const emitCategoryDeleted = (categoryId: string, deletedBy: string) =>
  publish('news.deleted', { categoryId, deletedBy, type: 'category_deleted' });
