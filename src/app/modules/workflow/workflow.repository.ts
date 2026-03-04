/**
 * Workflow Repository
 *
 * Handles ALL direct database interactions for the Workflow module.
 */

import { PopulateOptions } from 'mongoose';
import { Workflow } from './workflow.model';
import { TWorkflow, TWorkflowDocument } from './workflow.type';

type TPopulate = PopulateOptions | (string | PopulateOptions)[];

// ─── Create ───────────────────────────────────────────────────────────────────

export const create = async (
  payload: Partial<TWorkflow>,
): Promise<TWorkflowDocument> => {
  return await Workflow.create(payload);
};

// ─── Find One ────────────────────────────────────────────────────────────────

export const findById = async (
  id: string,
  options: { bypassDeleted?: boolean } = {},
): Promise<TWorkflowDocument | null> => {
  const query = Workflow.findById(id);
  if (options.bypassDeleted) {
    query.setOptions({ bypassDeleted: true });
  }
  return await query;
};

export const findOne = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
): Promise<TWorkflowDocument | null> => {
  let query = Workflow.findOne(filter);
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return await query;
};

export const findOneLean = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
): Promise<TWorkflow | null> => {
  let query = Workflow.findOne(filter).lean();
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return (await query) as TWorkflow | null;
};

// ─── Find Many ───────────────────────────────────────────────────────────────

export const findMany = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
): Promise<TWorkflowDocument[]> => {
  let query = Workflow.find(filter);
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return await query;
};

export const findManyLean = async (
  filter: Record<string, unknown>,
  populateFields: TPopulate[] = [],
): Promise<TWorkflow[]> => {
  let query = Workflow.find(filter).lean();
  if (populateFields.length > 0) {
    query = query.populate(populateFields as PopulateOptions[]);
  }
  return (await query) as TWorkflow[];
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const findByIdAndUpdate = async (
  id: string,
  payload: Partial<TWorkflow>,
): Promise<TWorkflowDocument | null> => {
  return await Workflow.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

export const updateOne = async (
  filter: Record<string, unknown>,
  payload: Partial<TWorkflow>,
): Promise<{ modifiedCount: number }> => {
  const result = await Workflow.updateOne(filter, payload);
  return { modifiedCount: result.modifiedCount };
};

// ─── Delete ──────────────────────────────────────────────────────────────────

export const deleteById = async (
  id: string,
): Promise<TWorkflowDocument | null> => {
  return await Workflow.findByIdAndDelete(id);
};

export const deleteMany = async (
  filter: Record<string, unknown>,
  options: { bypassDeleted?: boolean } = {},
): Promise<{ deletedCount: number }> => {
  const query = Workflow.deleteMany(filter);
  if (options.bypassDeleted) {
    query.setOptions({ bypassDeleted: true });
  }
  return await query;
};
