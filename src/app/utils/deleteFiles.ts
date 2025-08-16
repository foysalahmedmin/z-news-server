import fs from 'fs';
import path from 'path';

export const deleteFiles = (filePaths?: string | string[], folder?: string) => {
  if (!filePaths || (Array.isArray(filePaths) && filePaths?.length === 0))
    return;
  const paths = Array.isArray(filePaths) ? filePaths : [filePaths];

  paths.forEach((filePath) => {
    if (!filePath) return;

    // Resolve path inside uploads + optional folder
    const fullPath = folder
      ? path.resolve('uploads', folder, filePath)
      : path.resolve('uploads', filePath);

    fs.unlink(fullPath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.warn(`❌ Failed to delete file: ${fullPath}`, err.message);
      } else {
        console.log(`🗑️ Deleted file: ${fullPath}`);
      }
    });
  });
};
