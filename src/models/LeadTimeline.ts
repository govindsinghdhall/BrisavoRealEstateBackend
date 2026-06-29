import { Schema, model, type Document } from 'mongoose'
import { applyAutoIncrement } from '../utils/autoIncrement'

export interface ILeadTimeline extends Document<number> {
  organizationId: number
  leadId: number
  action: string
  description: string | null
  metadata: unknown
  performedById: number | null
  createdAt: Date
  updatedAt: Date
}

const leadTimelineSchema = new Schema<ILeadTimeline>(
  {
    _id: { type: Number },
    organizationId: { type: Number, required: true, index: true },
    leadId: { type: Number, ref: 'Lead', required: true, index: true },
    action: { type: String, required: true, trim: true },
    description: { type: String, default: null, trim: true },
    metadata: { type: Schema.Types.Mixed, default: null },
    performedById: { type: Number, ref: 'User', default: null },
  },
  { timestamps: true },
)

applyAutoIncrement(leadTimelineSchema, 'LeadTimeline')

export const LeadTimeline = model<ILeadTimeline>('LeadTimeline', leadTimelineSchema)
