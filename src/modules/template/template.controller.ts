import httpStatus from 'http-status';
import catchAsync from '../../utils/catch-async';
import sendResponse from '../../utils/send-response';
import { TemplateService } from './template.service';

const createTemplate = catchAsync(async (req, res) => {
  const result = await TemplateService.createTemplate(req.body);
  sendResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: 'Template created successfully!',
    data: result,
  });
});

const getAllTemplates = catchAsync(async (req, res) => {
  const result = await TemplateService.getAllTemplates(req.query);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Templates fetched successfully!',
    data: result,
  });
});

const getTemplateById = catchAsync(async (req, res) => {
  const result = await TemplateService.getTemplateById(req.params.id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Template fetched successfully!',
    data: result,
  });
});

const updateTemplate = catchAsync(async (req, res) => {
  const result = await TemplateService.updateTemplate(req.params.id, req.body);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Template updated successfully!',
    data: result,
  });
});

const deleteTemplate = catchAsync(async (req, res) => {
  const result = await TemplateService.deleteTemplate(req.params.id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Template deleted successfully!',
    data: result,
  });
});

export const TemplateController = {
  createTemplate,
  getAllTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
};
