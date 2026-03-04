import mongoose, { Query, Schema } from 'mongoose';
import { TTemplateDocument, TTemplateModel } from './template.type';

const templateSchema = new Schema<TTemplateDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    structure: { type: Schema.Types.Mixed, required: true },
    default_fields: { type: Schema.Types.Mixed, default: {} },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Query middleware to exclude deleted templates
templateSchema.pre(/^find/, function (next) {
  const query = this as unknown as Query<TTemplateDocument, TTemplateDocument>;
  query.where({ is_deleted: { $ne: true } });
  next();
});

// Static method
templateSchema.statics.isTemplateExist = async function (name: string) {
  return await this.findOne({ name });
};

// Instance methods
templateSchema.methods.softDelete = async function () {
  this.is_deleted = true;
  return await this.save();
};

export const Template = mongoose.model<TTemplateDocument, TTemplateModel>(
  'Template',
  templateSchema,
);
