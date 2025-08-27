import { dirYearMonth } from '../../utils/dirYearMonth';

export const folderMap = {
  thumbnail: 'news/images',
  image: 'news/images',
  video: 'news/videos',
  audio: 'news/audios',
  file: 'news/files',
  seo: 'news/seo/images',
};

export const folderMapWithYearMonth = {
  thumbnail: 'news/images' + '/' + dirYearMonth().suffix,
  image: 'news/images' + '/' + dirYearMonth().suffix,
  video: 'news/videos' + '/' + dirYearMonth().suffix,
  audio: 'news/audios' + '/' + dirYearMonth().suffix,
  file: 'news/files' + '/' + dirYearMonth().suffix,
  seo: 'news/seo/images' + '/' + dirYearMonth().suffix,
};

export const fileType = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'file';
};

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
        folder: folderMapWithYearMonth.image,
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
        folder: folderMapWithYearMonth.video,
        allowedTypes: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
        size: 50_000_000, // 50MB for videos
      };
    case 'audio':
      return {
        ...baseConfig,
        name: 'file',
        folder: folderMapWithYearMonth.audio,
        allowedTypes: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'],
        size: 20_000_000, // 20MB for audio
      };
    case 'file':
      return {
        ...baseConfig,
        name: 'file',
        folder: folderMapWithYearMonth.file,
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
        folder: folderMapWithYearMonth.file,
      };
  }
};
