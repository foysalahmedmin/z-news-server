import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catch-async';
import sendResponse from '../../utils/send-response';
import * as MediaService from './media.service';

export const createMedia = catchAsync(async (req: Request, res: Response) => {
  const result = await MediaService.createMedia(req.user!, req.body);
  sendResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: 'Media created successfully',
    data: result,
  });
});

export const getMedia = catchAsync(async (req: Request, res: Response) => {
  const result = await MediaService.getMedia(req.params.id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Media retrieved successfully',
    data: result,
  });
});

export const getBulkMedia = catchAsync(async (req: Request, res: Response) => {
  const result = await MediaService.getBulkMedia(
    req.query as Record<string, unknown>,
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Media list retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

export const updateMedia = catchAsync(async (req: Request, res: Response) => {
  const result = await MediaService.updateMedia(req.params.id, req.body);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Media updated successfully',
    data: result,
  });
});

export const deleteMedia = catchAsync(async (req: Request, res: Response) => {
  await MediaService.deleteMedia(req.params.id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Media deleted successfully',
    data: null,
  });
});
