import { Schema, model, type Document } from 'mongoose'
import { applyAutoIncrement } from '../utils/autoIncrement'

export interface ILead extends Document<number> {
  organizationId: number
  contactId: number | null
  firstName: string
  lastName: string
  email: string | null
  phone: string
  alternatePhone: string | null
  status: string
  priority: string | null
  budget: number | null
  requirements: string | null
  address: string | null
  city: string | null
  state: string | null
  pincode: string | null
  sourceId: number
  assignedToId: number | null
  propertyId: number | null
  createdById: number
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const leadSchema = new Schema<ILead>(
  {
    _id: { type: Number },
    organizationId: { type: Number, ref: 'Organization', required: true, index: true },
    contactId: { type: Number, ref: 'Contact', default: null },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, default: '', trim: true },
    email: { type: String, default: null, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    alternatePhone: { type: String, default: null, trim: true },
    status: { type: String, default: 'NEW', uppercase: true, trim: true, index: true },
    priority: { type: String, default: null, uppercase: true, trim: true },
    budget: { type: Number, default: null },
    requirements: { type: String, default: null, trim: true },
    address: { type: String, default: null, trim: true },
    city: { type: String, default: null, trim: true },
    state: { type: String, default: null, trim: true },
    pincode: { type: String, default: null, trim: true },
    sourceId: { type: Number, ref: 'LeadSource', required: true },
    assignedToId: { type: Number, ref: 'User', default: null },
    propertyId: { type: Number, ref: 'Property', default: null },
    createdById: { type: Number, ref: 'User', required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

applyAutoIncrement(leadSchema, 'Lead')
leadSchema.index({ organizationId: 1, status: 1 })

export const Lead = model<ILead>('Lead', leadSchema)
