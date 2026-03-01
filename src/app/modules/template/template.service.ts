import httpStatus from 'http-status';
import AppError from '../../builder/app-error';
import { Template } from './template.model';
import { TTemplate } from './template.type';

// Create a new template
const createTemplate = async (payload: TTemplate) => {
  const existingTemplate = await Template.findOne({ name: payload.name });
  if (existingTemplate) {
    throw new AppError(
      httpStatus.CONFLICT,
      'Template with this name already exists',
    );
  }

  const result = await Template.create(payload);
  return result;
};

// Get all templates (active only or all for admin)
const getAllTemplates = async (query: Record<string, any>) => {
  const result = await Template.find(query).populate('category', 'name slug');
  return result;
};

// Get a single template
const getTemplateById = async (id: string) => {
  const result = await Template.findById(id).populate('category', 'name slug');
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Template not found');
  }
  return result;
};

// Update a template
const updateTemplate = async (id: string, payload: Partial<TTemplate>) => {
  const result = await Template.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Template not found');
  }

  return result;
};

// Delete a template (soft delete)
const deleteTemplate = async (id: string) => {
  const template = await Template.findById(id);
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
