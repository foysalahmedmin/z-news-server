import fs from 'fs';
import mime from 'mime-types';
import path from 'path';

import { TMedia } from './media.type';

export const getMedias = async (
  folder: string = '',
  base: string = '',
): Promise<TMedia[]> => {
  console.log(folder);
  const uploadPath = path.join(
    __dirname,
    '../../../../uploads',
    (folder || '').trim(),
  );

  console.log(uploadPath);

  if (!fs.existsSync(uploadPath)) {
    throw new Error('Folder not found');
  }

  const files = fs.readdirSync(uploadPath);

  const result: TMedia[] = files.map((file) => {
    const filePath = path.join(uploadPath, file);
    const stats = fs.statSync(filePath);

    const mimetype = mime.lookup(file) || 'application/octet-stream';

    // type বের করা image/video/audio/file
    let type: TMedia['type'] = 'file';
    if (mimetype.startsWith('image/')) type = 'image';
    else if (mimetype.startsWith('video/')) type = 'video';
    else if (mimetype.startsWith('audio/')) type = 'audio';

    return {
      type,
      filename: file,
      path: `/uploads/${folder}/${file}`,
      url: `${base}/uploads/${folder}/${file}`,
      size: stats.size,
      mimetype,
    };
  });

  return result;
};
