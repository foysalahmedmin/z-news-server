import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import httpStatus from 'http-status';
import path from 'path';
import AppError from '../builder/app-error';
import catchAsync from '../utils/catch-async';
import { File } from '../modules/file/file.model';
import * as FileServices from '../modules/file/file.service';
import file from './file.middleware';

type TFileConfig = {
  name: string;
  folder: string;
  size?: number;
  maxCount?: number;
  minCount?: number;
  allowedTypes?: string[];
};

type TUploadConfig = TFileConfig & {
  category?: string;
  caption?: string;
  description?: string;
};

const upload = (...configs: TUploadConfig[]) => {
  // Extract file configs (without metadata) for file middleware
  const fileConfigs: TFileConfig[] = configs.map((config) => ({
    name: config.name,
    folder: config.folder,
    size: config.size,
    maxCount: config.maxCount,
    minCount: config.minCount,
    allowedTypes: config.allowedTypes,
  }));

  // Create file middleware instance
  const fileMiddleware = file(...fileConfigs);

  // Return upload middleware that wraps file middleware
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // First, run file middleware to handle actual file upload
    await new Promise<void>((resolve, reject) => {
      fileMiddleware(req, res, (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    try {
      // Check if user is authenticated (required for DB creation)
      if (!req.user?._id) {
        // Rollback: delete uploaded files
        const files = req.files as Record<string, Express.Multer.File[]>;
        const filePaths: string[] = [];
        Object.values(files).forEach((fileArray) => {
          if (Array.isArray(fileArray)) {
            fileArray.forEach((file) => {
              if (file.path) {
                filePaths.push(file.path);
              }
            });
          }
        });

        // Delete physical files
        for (const filePath of filePaths) {
          try {
            const fullPath = path.resolve(filePath);
            fs.unlinkSync(fullPath);
          } catch (err: any) {
            if (err.code !== 'ENOENT') {
              console.warn(`Failed to delete file: ${filePath}`, err.message);
            }
          }
        }

        throw new AppError(
          httpStatus.UNAUTHORIZED,
          'Authentication required for file upload',
        );
      }

      const baseUrl = req.protocol + '://' + req.get('host');
      const files = req.files as Record<string, Express.Multer.File[]>;
      const fileIds: Record<string, string[]> = {};

      // Process each field
      for (const config of configs) {
        const fieldFiles = files?.[config.name];
        if (!fieldFiles || fieldFiles.length === 0) {
          continue;
        }

        const ids: string[] = [];
        const uploadedPaths: string[] = [];
        const createdFileIds: string[] = [];

        // Process each file in the field
        for (const file of fieldFiles) {
          try {
            // Get metadata from request body (per-field or global)
            const category =
              req.body[`${config.name}_category`] ||
              req.body.category ||
              config.category;
            const caption =
              req.body[`${config.name}_caption`] ||
              req.body.caption ||
              config.caption;
            const description =
              req.body[`${config.name}_description`] ||
              req.body.description ||
              config.description;

            // Create file payload
            const payload = {
              name:
                req.body[`${config.name}_name`] ||
                req.body.name ||
                file.originalname,
              category,
              caption,
              description,
              status: req.body.status || 'active',
            };

            // Create file document in DB
            const fileDocument = await FileServices.createFile(
              req.user!,
              file,
              payload,
              baseUrl,
            );

            // Extract _id from the document (Mongoose toObject() includes _id)
            const fileId = (fileDocument as any)._id?.toString();
            if (!fileId) {
              throw new AppError(
                httpStatus.INTERNAL_SERVER_ERROR,
                'Failed to get file ID after creation',
              );
            }

            ids.push(fileId);
            createdFileIds.push(fileId);
            uploadedPaths.push(file.path);
          } catch (error) {
            // Rollback: delete physical files for this field
            for (const filePath of uploadedPaths) {
              try {
                const fullPath = path.resolve(filePath);
                fs.unlinkSync(fullPath);
              } catch (err: any) {
                if (err.code !== 'ENOENT') {
                  console.warn(`Failed to delete file: ${filePath}`, err.message);
                }
              }
            }

            // Rollback: delete DB documents that were created
            if (createdFileIds.length > 0) {
              try {
                // Delete newly created documents directly (they're not soft-deleted yet)
                await File.deleteMany({ _id: { $in: createdFileIds } });
              } catch (dbErr) {
                console.error('Failed to rollback DB documents:', dbErr);
              }
            }

            throw new AppError(
              httpStatus.INTERNAL_SERVER_ERROR,
              `Failed to create file document: ${
                error instanceof Error ? error.message : 'Unknown error'
              }`,
            );
          }
        }

        fileIds[config.name] = ids;
      }

      // Transform req.files to contain _ids instead of file objects
      (req.files as any) = fileIds;

      // Store _ids in req.uploads (same structure as req.files)
      (req as any).uploads = fileIds;

      next();
    } catch (error) {
      // If error occurs after file upload, rollback physical files
      const files = req.files as Record<string, Express.Multer.File[]>;
      const filePaths: string[] = [];
      Object.values(files).forEach((fileArray) => {
        if (Array.isArray(fileArray)) {
          fileArray.forEach((file) => {
            if (file.path) {
              filePaths.push(file.path);
            }
          });
        }
      });

      // Delete physical files
      for (const filePath of filePaths) {
        try {
          const fullPath = path.resolve(filePath);
          fs.unlinkSync(fullPath);
        } catch (err: any) {
          if (err.code !== 'ENOENT') {
            console.warn(`Failed to delete file: ${filePath}`, err.message);
          }
        }
      }

      next(error);
    }
  });
};

export default upload;

