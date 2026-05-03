import { Router } from 'express';
import auth from '../../middlewares/auth.middleware';
import validation from '../../middlewares/validation.middleware';
import { TemplateController } from './template.controller';
import { TemplateValidation } from './template.validator';

const router = Router();

// Create a template
router.post(
  '/',
  auth('super-admin', 'admin'),
  validation(TemplateValidation.createTemplateValidationSchema),
  TemplateController.createTemplate,
);

// Get all templates (active only or all for admin/editor)
router.get(
  '/',
  auth('super-admin', 'admin', 'editor', 'author'),
  TemplateController.getAllTemplates,
);

// Get a single template
router.get(
  '/:id',
  auth('super-admin', 'admin', 'editor', 'author'),
  TemplateController.getTemplateById,
);

// Update a template
router.patch(
  '/:id',
  auth('super-admin', 'admin'),
  validation(TemplateValidation.updateTemplateValidationSchema),
  TemplateController.updateTemplate,
);

// Delete a template
router.delete(
  '/:id',
  auth('super-admin', 'admin'),
  validation(TemplateValidation.templateOperationValidationSchema),
  TemplateController.deleteTemplate,
);

const TemplateRoutes = router;

export default TemplateRoutes;
