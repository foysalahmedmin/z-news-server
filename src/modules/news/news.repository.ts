/**
 * News Repository
 *
 * Handles ALL direct database interactions for the News module.
 */

import { PopulateOptions, UpdateQuery } from 'mongoose';
import AppQueryFind from '../../builder/app-query-find';
import { News } from './news.model';
import { TNews, TNewsDocument } from './news.type';

type TPopulate = string | PopulateOptions | (string | PopulateOptions)[];

// ─── Create ───────────────────────────────────────────────────────────────────

export const create = async (
  payload: Partial<TNews>,
): Promise<TNewsDocument> => {
  return await News.create(payload);
};

// ─── Find One ────────────────────────────────────────────────────────────────

export const findById = async (
  id: string,
  options: { bypassDeleted?: boolean } = {},
): Promise<TNewsDocument | null> => {
  const query = News.findById(id);
  if (options.bypassDeleted) {
    query.setOptions({ bypassDeleted: true });
  }
  return await query;
};

export const findOne = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
): Promise<TNewsDocument | null> => {
  let query = News.findOne(filter);
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return await query;
};

export const findOneLean = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
  options: { bypassDeleted?: boolean } = {},
): Promise<TNews | null> => {
  let query = News.findOne(filter).lean();
  if (options.bypassDeleted) {
    query.setOptions({ bypassDeleted: true });
  }
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return (await query) as TNews | null;
};

// ─── Find Many ───────────────────────────────────────────────────────────────

export const findMany = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
  sort: Record<string, 1 | -1> = { published_at: -1 },
): Promise<TNewsDocument[]> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sortQuery = sort as any;
  let query = News.find(filter).sort(sortQuery);
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return await query;
};

export const findManyLean = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
  options: { bypassDeleted?: boolean; sort?: Record<string, 1 | -1> } = {},
): Promise<TNews[]> => {
  const { bypassDeleted, sort = { published_at: -1 } } = options;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sortQuery = sort as any;
  let query = News.find(filter).sort(sortQuery).lean();
  if (bypassDeleted) {
    query.setOptions({ bypassDeleted: true });
  }
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return (await query) as TNews[];
};

// ─── Paginated Lists ─────────────────────────────────────────────────────────

export const findPublicPaginated = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
) => {
  const newsQuery = new AppQueryFind(News, { status: 'published', ...filter })
    .populate(populateFields as PopulateOptions[])
    .search(['title', 'description'])
    .filter()
    .sort()
    .paginate()
    .fields([
      'title',
      'sub_title',
      'slug',
      'description',
      'content',
      'thumbnail',
      'video',
      'youtube',
      'author',
      'writer',
      'category',
      'tags',
      'status',
      'layout',
      'published_at',
      'is_featured',
      'views',
      'likes',
      'dislikes',
      'comments',
    ])
    .tap((q) => q.lean());

  return await newsQuery.execute();
};

export const findSelfPaginated = async (
  authorId: string,
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
  facets?: { key: string; filter: Record<string, unknown> }[],
) => {
  const newsQuery = new AppQueryFind(News, { author: authorId, ...filter })
    .populate(populateFields as PopulateOptions[])
    .search(['title', 'description'])
    .filter()
    .sort()
    .paginate()
    .fields([
      'title',
      'slug',
      'description',
      'content',
      'thumbnail',
      'video',
      'youtube',
      'author',
      'writer',
      'category',
      'tags',
      'status',
      'layout',
      'published_at',
      'is_featured',
      'views',
      'likes',
      'dislikes',
      'comments',
    ])
    .tap((q) => q.lean());

  return await newsQuery.execute(facets);
};

export const findAdminPaginated = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
  facets?: { key: string; filter: Record<string, unknown> }[],
) => {
  const newsQuery = new AppQueryFind(News, filter)
    .populate(populateFields as PopulateOptions[])
    .search(['title', 'description'])
    .filter()
    .sort()
    .paginate()
    .fields([
      'title',
      'slug',
      'description',
      'content',
      'thumbnail',
      'video',
      'youtube',
      'author',
      'writer',
      'category',
      'tags',
      'status',
      'layout',
      'published_at',
      'is_featured',
      'views',
      'likes',
      'dislikes',
      'comments',
    ])
    .tap((q) => q.lean());

  return await newsQuery.execute(facets);
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const findByIdAndUpdate = async (
  id: string,
  payload: UpdateQuery<TNewsDocument>,
): Promise<TNewsDocument | null> => {
  return await News.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

export const updateOne = async (
  filter: Record<string, unknown>,
  payload: UpdateQuery<TNewsDocument>,
): Promise<TNewsDocument | null> => {
  return await News.findOneAndUpdate(filter, payload, {
    new: true,
    runValidators: true,
  });
};

export const updateMany = async (
  filter: Record<string, unknown>,
  payload: UpdateQuery<TNewsDocument>,
  options: { bypassDeleted?: boolean } = {},
): Promise<{ modifiedCount: number }> => {
  const query = News.updateMany(filter, payload);
  if (options.bypassDeleted) {
    query.setOptions({ bypassDeleted: true });
  }
  return await query;
};

export const restoreById = async (
  id: string,
): Promise<TNewsDocument | null> => {
  return await News.findOneAndUpdate(
    { _id: id, is_deleted: true },
    { is_deleted: false },
    { new: true },
  );
};

export const restoreManyByIds = async (
  ids: string[],
): Promise<{ modifiedCount: number }> => {
  return await News.updateMany(
    { _id: { $in: ids }, is_deleted: true },
    { is_deleted: false },
  );
};

// ─── Delete ──────────────────────────────────────────────────────────────────

export const deleteById = async (id: string): Promise<TNewsDocument | null> => {
  return await News.findByIdAndDelete(id);
};

export const deleteMany = async (
  filter: Record<string, unknown>,
  options: { bypassDeleted?: boolean } = {},
): Promise<{ deletedCount: number }> => {
  const query = News.deleteMany(filter);
  if (options.bypassDeleted) {
    query.setOptions({ bypassDeleted: true });
  }
  return await query;
};
