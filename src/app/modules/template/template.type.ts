import { Document, Model, Types } from 'mongoose';

export type TTemplate = {
  _id?: Types.ObjectId | string;
  name: string;
  description?: string;
  category?: Types.ObjectId;
  structure: Record<string, unknown>; // BlockNote JSON structure or other rich text structure
  default_fields?: Record<string, unknown>;
  is_active: boolean;
  is_deleted: boolean;
};

export interface TTemplateDocument extends TTemplate, Document {
  _id: Types.ObjectId;
  softDelete(): Promise<TTemplateDocument | null>;
}

export type TTemplateModel = Model<TTemplateDocument> & {
  isTemplateExist(name: string): Promise<TTemplateDocument | null>;
};
