import { Schema, model, type Document } from 'mongoose'
import { applyAutoIncrement } from '../utils/autoIncrement'

export const PROPERTY_LOOKUP_TYPES = [
  'LOCALITY',
  'SECTOR',
  'LANDMARK',
  'PINCODE',
  'BUILDER',
] as const

export type PropertyLookupType = (typeof PROPERTY_LOOKUP_TYPES)[number]

export interface IPropertyLookup extends Document<number> {
  organizationId: number
  type: PropertyLookupType
  value: string
  normalizedValue: string
  usageCount: number
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const propertyLookupSchema = new Schema<IPropertyLookup>(
  {
    _id: { type: Number },
    organizationId: { type: Number, ref: 'Organization', required: true, index: true },
    type: { type: String, required: true, uppercase: true, trim: true },
    value: { type: String, required: true, trim: true },
    normalizedValue: { type: String, required: true, lowercase: true, trim: true },
    usageCount: { type: Number, default: 1, min: 0 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

applyAutoIncrement(propertyLookupSchema, 'PropertyLookup')
propertyLookupSchema.index({ organizationId: 1, type: 1, normalizedValue: 1 }, { unique: true })

export const PropertyLookup = model<IPropertyLookup>('PropertyLookup', propertyLookupSchema)
