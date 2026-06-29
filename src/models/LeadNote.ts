import { Schema, model, type Document } from 'mongoose'
import { applyAutoIncrement } from '../utils/autoIncrement'

export interface ILeadNote extends Document<number> {
  organizationId: number
  leadId: number
  content: string
  createdById: number
  createdAt: Date
  updatedAt: Date
}

const leadNoteSchema = new Schema<ILeadNote>(
  {
    _id: { type: Number },
    organizationId: { type: Number, required: true, index: true },
    leadId: { type: Number, ref: 'Lead', required: true, index: true },
    content: { type: String, required: true, trim: true },
    createdById: { type: Number, ref: 'User', required: true },
  },
  { timestamps: true },
)

applyAutoIncrement(leadNoteSchema, 'LeadNote')

export const LeadNote = model<ILeadNote>('LeadNote', leadNoteSchema)
