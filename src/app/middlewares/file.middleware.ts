import { NextFunction, Request, Response } from "express";
import fs from "fs";
import httpStatus from "http-status";
import multer from "multer";
import path from "path";
import AppError from "../builder/AppError";
import catchAsync from "../utils/catchAsync";

type TFile = {
  name: string;
  folder: string;
};

const file = (...files: TFile[]) => {
  const storage = multer.diskStorage({
    destination: (_req, file, cb) => {
      const folder =
        files.find((item) => item.name === file.fieldname)?.folder || "";
      const dir = path.join("uploads", folder);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext);
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${baseName}-${uniqueSuffix}${ext}`);
    },
  });

  const upload = multer({ storage }).fields(
    files.map((item) => ({
      name: item.name,
      maxCount: 1,
    })),
  );

  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, (err: any) => {
      if (err) {
        return next(
          new AppError(
            httpStatus.BAD_REQUEST,
            err.message || "File upload error",
          ),
        );
      }

      try {
        const missingFields = files.filter(
          (file) =>
            !req.files ||
            !(req.files as Record<string, Express.Multer.File[]>)[file.name]
              ?.length,
        );

        if (missingFields.length > 0) {
          const fieldNames = missingFields.map((f) => `"${f.name}"`).join(", ");
          throw new AppError(
            httpStatus.BAD_REQUEST,
            `Missing file(s) in field(s): ${fieldNames}`,
          );
        }

        // Optional: expects old file path in req.filePath
        const oldFilePath = (req as Request & { filePath?: string }).filePath;
        if (oldFilePath) {
          const fullPath = path.resolve(oldFilePath);
          fs.unlink(fullPath, (err) => {
            if (err && err.code !== "ENOENT") {
              console.warn(
                `Failed to delete old file: ${fullPath}`,
                err.message,
              );
            }
          });
        }

        next();
      } catch (error) {
        next(error);
      }
    });
  });
};

export default file;
