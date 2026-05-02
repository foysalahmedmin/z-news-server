import httpStatus from 'http-status';
import { Types } from 'mongoose';
import AppError from '../../builder/app-error';
import { TJwtPayload } from '../../types/jsonwebtoken.type';
import * as MediaRepository from './media.repository';
import { TMedia } from './media.type';

export const createMedia = async (
  user: TJwtPayload,
  payload: Partial<TMedia>,
): Promise<TMedia> => {
  const data = {
    ...payload,
    uploaded_by: new Types.ObjectId(user._id),
  } as TMedia;
  const result = await MediaRepository.create(data);
  return result.toObject() as TMedia;
};

export const getMedia = async (id: string): Promise<TMedia> => {
  const result = await MediaRepository.findOneLean({ _id: id }, [
    { path: 'file', select: '_id url name filename mimetype size' },
    { path: 'uploaded_by', select: '_id name email image' },
  ]);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Media not found');
  }
  return result;
};

export const getBulkMedia = async (query: Record<string, unknown>) => {
  return await MediaRepository.findPaginated(query, [
    { path: 'file', select: '_id url name filename mimetype size' },
    { path: 'uploaded_by', select: '_id name email image' },
  ]);
};

export const updateMedia = async (
  id: string,
  payload: Partial<TMedia>,
): Promise<TMedia> => {
  const existing = await MediaRepository.findById(id);
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, 'Media not found');
  }
  const result = await MediaRepository.findByIdAndUpdate(id, payload);
  return result!.toObject() as TMedia;
};

export const deleteMedia = async (id: string): Promise<void> => {
  const media = await MediaRepository.findOne({ _id: id });
  if (!media) {
    throw new AppError(httpStatus.NOT_FOUND, 'Media not found');
  }
  await media.softDelete();
};
