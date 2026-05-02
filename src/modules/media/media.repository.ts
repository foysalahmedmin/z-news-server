import { FilterQuery, PopulateOptions } from 'mongoose';
import AppQueryFind from '../../builder/app-query-find';
import { TMedia, TMediaDocument } from './media.type';
import { Media } from './media.model';

export const create = async (
  data: Partial<TMedia>,
): Promise<TMediaDocument> => {
  return await Media.create(data);
};

export const findById = async (id: string): Promise<TMediaDocument | null> => {
  return await Media.findById(id);
};

export const findOne = async (
  filter: FilterQuery<TMedia>,
): Promise<TMediaDocument | null> => {
  return await Media.findOne(filter);
};

export const findOneLean = async (
  filter: FilterQuery<TMedia>,
  populate: PopulateOptions[] = [],
): Promise<TMedia | null> => {
  return await Media.findOne(filter).populate(populate).lean();
};

export const findPaginated = async (
  query: Record<string, unknown>,
  populate: PopulateOptions[] = [],
) => {
  return await new AppQueryFind(Media, query)
    .search(['title', 'description', 'alt_text'])
    .filter(['type', 'status', 'uploaded_by', 'tags'])
    .sort()
    .paginate()
    .populate(populate)
    .execute();
};

export const findByIdAndUpdate = async (
  id: string,
  data: Partial<TMedia>,
): Promise<TMediaDocument | null> => {
  return await Media.findByIdAndUpdate(id, { $set: data }, { new: true });
};

export const deleteById = async (id: string): Promise<void> => {
  await Media.findByIdAndDelete(id);
};
