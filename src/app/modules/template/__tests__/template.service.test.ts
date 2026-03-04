/**
 * template.service.test.ts
 *
 * Unit tests for the Template Service layer.
 */

import httpStatus from 'http-status';
import { Types } from 'mongoose';

// ── Mock dependencies ─────────────────────────────────────────────────────────
jest.mock('../template.repository');

import * as TemplateRepository from '../template.repository';
import { TemplateService } from '../template.service';
import { TTemplate, TTemplateDocument } from '../template.type';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockTemplateDoc = (
  overrides: Partial<TTemplate> = {},
): TTemplateDocument =>
  ({
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    name: 'Default Template',
    structure: { blocks: [] },
    is_active: true,
    is_deleted: false,
    softDelete: jest.fn().mockResolvedValue(true),
    ...overrides,
  }) as unknown as TTemplateDocument;

// ─── createTemplate ─────────────────────────────────────────────────────────

describe('TemplateService.createTemplate', () => {
  it('should create a template successfully', async () => {
    const payload = { name: 'New Template', structure: {} } as TTemplate;
    const mockCreated = mockTemplateDoc(payload);

    (TemplateRepository.findOne as jest.Mock).mockResolvedValue(null);
    (TemplateRepository.create as jest.Mock).mockResolvedValue(mockCreated);

    const result = await TemplateService.createTemplate(payload);

    expect(TemplateRepository.findOne).toHaveBeenCalledWith({
      name: payload.name,
    });
    expect(TemplateRepository.create).toHaveBeenCalledWith(payload);
    expect(result).toEqual(mockCreated);
  });

  it('should throw CONFLICT if template name exists', async () => {
    const payload = { name: 'Existing' } as TTemplate;
    (TemplateRepository.findOne as jest.Mock).mockResolvedValue(
      mockTemplateDoc(),
    );

    await expect(TemplateService.createTemplate(payload)).rejects.toMatchObject(
      { status: httpStatus.CONFLICT },
    );
  });
});

// ─── getAllTemplates ─────────────────────────────────────────────────────────

describe('TemplateService.getAllTemplates', () => {
  it('should return a list of templates', async () => {
    const mockList = [mockTemplateDoc()];
    (TemplateRepository.findMany as jest.Mock).mockResolvedValue(mockList);

    const result = await TemplateService.getAllTemplates({});

    expect(TemplateRepository.findMany).toHaveBeenCalledWith({}, ['category']);
    expect(result).toEqual(mockList);
  });
});

// ─── getTemplateById ─────────────────────────────────────────────────────────

describe('TemplateService.getTemplateById', () => {
  it('should return template if found', async () => {
    const mockDoc = mockTemplateDoc();
    (TemplateRepository.findOne as jest.Mock).mockResolvedValue(mockDoc);

    const result = await TemplateService.getTemplateById(
      '507f1f77bcf86cd799439011',
    );

    expect(TemplateRepository.findOne).toHaveBeenCalledWith(
      { _id: '507f1f77bcf86cd799439011' },
      ['category'],
    );
    expect(result).toEqual(mockDoc);
  });

  it('should throw NOT_FOUND if not found', async () => {
    (TemplateRepository.findOne as jest.Mock).mockResolvedValue(null);

    await expect(TemplateService.getTemplateById('id')).rejects.toMatchObject({
      status: httpStatus.NOT_FOUND,
    });
  });
});

// ─── updateTemplate ─────────────────────────────────────────────────────────

describe('TemplateService.updateTemplate', () => {
  it('should update template successfully', async () => {
    const updated = mockTemplateDoc({ name: 'Updated' });
    (TemplateRepository.findByIdAndUpdate as jest.Mock).mockResolvedValue(
      updated,
    );

    const result = await TemplateService.updateTemplate('id', {
      name: 'Updated',
    });

    expect(TemplateRepository.findByIdAndUpdate).toHaveBeenCalledWith('id', {
      name: 'Updated',
    });
    expect(result).toEqual(updated);
  });
});

// ─── deleteTemplate ─────────────────────────────────────────────────────────

describe('TemplateService.deleteTemplate', () => {
  it('should soft delete template', async () => {
    const mockDoc = mockTemplateDoc();
    (TemplateRepository.findById as jest.Mock).mockResolvedValue(mockDoc);

    const result = await TemplateService.deleteTemplate(mockDoc._id.toString());

    expect(mockDoc.softDelete).toHaveBeenCalled();
    expect(result).toEqual(mockDoc);
  });
});
