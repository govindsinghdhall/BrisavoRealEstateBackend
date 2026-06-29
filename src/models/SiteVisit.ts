import { Schema, model, type Document } from 'mongoose'
import { applyAutoIncrement } from '../utils/autoIncrement'

export interface ISiteVisit extends Document<number> {
  organizationId: number
  leadId: number
  agentId: number
  propertyId: number | null
  scheduledAt: Date
  status: string
  notes: string | null
  feedback: string | null
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const siteVisitSchema = new Schema<ISiteVisit>(
  {
    _id: { type: Number },
    organizationId: { type: Number, ref: 'Organization', required: true, index: true },
    leadId: { type: Number, ref: 'Lead', required: true, index: true },
    agentId: { type: Number, ref: 'User', required: true },
    propertyId: { type: Number, ref: 'Property', default: null },
    scheduledAt: { type: Date, required: true, index: true },
    status: { type: String, default: 'SCHEDULED', uppercase: true, trim: true, index: true },
    notes: { type: String, default: null },
    feedback: { type: String, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

applyAutoIncrement(siteVisitSchema, 'SiteVisit')

export const SiteVisit = model<ISiteVisit>('SiteVisit', siteVisitSchema)
