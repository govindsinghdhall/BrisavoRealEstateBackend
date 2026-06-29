import { Schema, model, type Document } from 'mongoose'
import { applyAutoIncrement } from '../utils/autoIncrement'

export interface IBooking extends Document<number> {
  organizationId: number
  bookingNumber: string
  leadId: number
  agentId: number
  propertyId: number | null
  status: string
  totalAmount: number
  paidAmount: number
  bookingDate: Date
  notes: string | null
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const bookingSchema = new Schema<IBooking>(
  {
    _id: { type: Number },
    organizationId: { type: Number, ref: 'Organization', required: true, index: true },
    bookingNumber: { type: String, required: true, trim: true },
    leadId: { type: Number, ref: 'Lead', required: true, index: true },
    agentId: { type: Number, ref: 'User', required: true },
    propertyId: { type: Number, ref: 'Property', default: null },
    status: { type: String, default: 'PENDING', uppercase: true, trim: true, index: true },
    totalAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    bookingDate: { type: Date, default: () => new Date() },
    notes: { type: String, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

applyAutoIncrement(bookingSchema, 'Booking')
bookingSchema.index({ organizationId: 1, bookingNumber: 1 }, { unique: true })

export const Booking = model<IBooking>('Booking', bookingSchema)
