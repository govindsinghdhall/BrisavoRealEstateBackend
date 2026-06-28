import { Schema, model, type Document } from 'mongoose'
import { applyAutoIncrement } from '../utils/autoIncrement'

export interface ILeadSource extends Document<number> {
  organizationId: number
  name: string
  type: string
  isSystem: boolean
  createdAt: Date
  updatedAt: Date
}

const leadSourceSchema = new Schema<ILeadSource>(
  {
    _id: { type: Number },
    organizationId: { type: Number, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true, uppercase: true },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true },
)

applyAutoIncrement(leadSourceSchema, 'LeadSource')

leadSourceSchema.index({ organizationId: 1, name: 1 }, { unique: true })

export const LeadSource = model<ILeadSource>('LeadSource', leadSourceSchema)
