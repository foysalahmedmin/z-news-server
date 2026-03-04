import httpStatus from 'http-status';
import AppError from '../../builder/app-error';
import * as TemplateRepository from './template.repository';
import { TTemplate } from './template.type';

// Create a new template
const createTemplate = async (payload: TTemplate) => {
  const existingTemplate = await TemplateRepository.findOne({
    name: payload.name,
  });
  if (existingTemplate) {
    throw new AppError(
      httpStatus.CONFLICT,
      'Template with this name already exists',
    );
  }

  const result = await TemplateRepository.create(payload);
  return result;
};

// Get all templates (active only or all for admin)
const getAllTemplates = async (query: Record<string, unknown>) => {
  const result = await TemplateRepository.findMany(query, ['category']);
  return result;
};

// Get a single template
const getTemplateById = async (id: string) => {
  const result = await TemplateRepository.findOne({ _id: id }, ['category']);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Template not found');
  }
  return result;
};

// Update a template
const updateTemplate = async (id: string, payload: Partial<TTemplate>) => {
  const result = await TemplateRepository.findByIdAndUpdate(id, payload);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Template not found');
  }

  return result;
};

// Delete a template (soft delete)
const deleteTemplate = async (id: string) => {
  const template = await TemplateRepository.findById(id);
  if (!template) {
    throw new AppError(httpStatus.NOT_FOUND, 'Template not found');
  }

  await template.softDelete();
  return template;
};

export const TemplateService = {
  createTemplate,
  getAllTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
};
