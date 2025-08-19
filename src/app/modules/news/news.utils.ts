export const getFileConfigByType = (type: string) => {
  const baseConfig = {
    size: 10_000_000, // 10MB default
    maxCount: 1,
    minCount: 1,
  };

  switch (type) {
    case 'image':
      return {
        ...baseConfig,
        name: 'file',
        folder: 'news/images',
        allowedTypes: [
          'image/jpeg',
          'image/png',
          'image/jpg',
          'image/gif',
          'image/webp',
        ],
        size: 5_000_000, // 5MB for images
      };
    case 'video':
      return {
        ...baseConfig,
        name: 'file',
        folder: 'news/videos',
        allowedTypes: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
        size: 50_000_000, // 50MB for videos
      };
    case 'audio':
      return {
        ...baseConfig,
        name: 'file',
        folder: 'news/audios',
        allowedTypes: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'],
        size: 20_000_000, // 20MB for audio
      };
    case 'file':
      return {
        ...baseConfig,
        name: 'file',
        folder: 'news/files',
        allowedTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        size: 15_000_000, // 15MB for documents
      };
    default:
      return {
        ...baseConfig,
        name: 'file',
        folder: 'news/files',
      };
  }
};
