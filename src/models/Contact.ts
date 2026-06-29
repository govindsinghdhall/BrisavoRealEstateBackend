import { Schema, model, type Document } from 'mongoose'
import { applyAutoIncrement } from '../utils/autoIncrement'

export interface IContact extends Document<number> {
  organizationId: number
  firstName: string
  lastName: string
  email: string | null
  phone: string
  alternatePhone: string | null
  address: string | null
  city: string | null
  state: string | null
  pincode: string | null
  sourceId: number | null
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const contactSchema = new Schema<IContact>(
  {
    _id: { type: Number },
    organizationId: { type: Number, ref: 'Organization', required: true, index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, default: '', trim: true },
    email: { type: String, default: null, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    alternatePhone: { type: String, default: null, trim: true },
    address: { type: String, default: null, trim: true },
    city: { type: String, default: null, trim: true },
    state: { type: String, default: null, trim: true },
    pincode: { type: String, default: null, trim: true },
    sourceId: { type: Number, ref: 'LeadSource', default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

applyAutoIncrement(contactSchema, 'Contact')
contactSchema.index({ organizationId: 1, phone: 1 })

export const Contact = model<IContact>('Contact', contactSchema)
