import { publish } from '../../events/event-publisher';

export const emitMediaUploaded = (
  mediaId: string,
  uploadedBy: string,
  mediaType: string,
) =>
  publish('news.created', {
    mediaId,
    uploadedBy,
    mediaType,
    type: 'media_uploaded',
  });

export const emitMediaDeleted = (mediaId: string, deletedBy: string) =>
  publish('news.deleted', { mediaId, deletedBy, type: 'media_deleted' });
