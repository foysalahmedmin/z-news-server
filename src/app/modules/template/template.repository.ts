/**
 * Template Repository
 *
 * Handles ALL direct database interactions for the Template module.
 */

import { PopulateOptions } from 'mongoose';
import { Template } from './template.model';
import { TTemplate, TTemplateDocument } from './template.type';

type TPopulate = string | PopulateOptions | (string | PopulateOptions)[];

// ─── Create ───────────────────────────────────────────────────────────────────

export const create = async (
  payload: Partial<TTemplate>,
): Promise<TTemplateDocument> => {
  return await Template.create(payload);
};

// ─── Find One ────────────────────────────────────────────────────────────────

export const findById = async (
  id: string,
  options: { bypassDeleted?: boolean } = {},
): Promise<TTemplateDocument | null> => {
  const query = Template.findById(id);
  if (options.bypassDeleted) {
    query.setOptions({ bypassDeleted: true });
  }
  return await query;
};

export const findOne = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
): Promise<TTemplateDocument | null> => {
  let query = Template.findOne(filter);
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return await query;
};

export const findOneLean = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
): Promise<TTemplate | null> => {
  let query = Template.findOne(filter).lean();
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return (await query) as TTemplate | null;
};

// ─── Find Many ───────────────────────────────────────────────────────────────

export const findMany = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
): Promise<TTemplateDocument[]> => {
  let query = Template.find(filter);
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return await query;
};

export const findManyLean = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
): Promise<TTemplate[]> => {
  let query = Template.find(filter).lean();
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return (await query) as TTemplate[];
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const findByIdAndUpdate = async (
  id: string,
  payload: Partial<TTemplate>,
): Promise<TTemplateDocument | null> => {
  return await Template.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

export const findByIdAndUpdateLean = async (
  id: string,
  payload: Partial<TTemplate>,
): Promise<TTemplate | null> => {
  return (await Template.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean()) as TTemplate | null;
};

// ─── Delete ──────────────────────────────────────────────────────────────────

export const deleteById = async (
  id: string,
): Promise<TTemplateDocument | null> => {
  return await Template.findByIdAndDelete(id);
};

export const deleteMany = async (
  filter: Record<string, unknown>,
  options: { bypassDeleted?: boolean } = {},
): Promise<{ deletedCount: number }> => {
  const query = Template.deleteMany(filter);
  if (options.bypassDeleted) {
    query.setOptions({ bypassDeleted: true });
  }
  return await query;
};
