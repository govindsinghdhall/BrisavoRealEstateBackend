import { Schema, model, type Document } from 'mongoose'
import type { Permission } from '../constants/permissions'
import { applyAutoIncrement } from '../utils/autoIncrement'

export interface IRole extends Document<number> {
  organizationId: number
  name: string
  permissions: Permission[]
  isSystem: boolean
  createdAt: Date
  updatedAt: Date
}

const roleSchema = new Schema<IRole>(
  {
    _id: { type: Number },
    organizationId: { type: Number, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true, lowercase: true },
    permissions: [{ type: String }],
    isSystem: { type: Boolean, default: true },
  },
  { timestamps: true },
)

applyAutoIncrement(roleSchema, 'Role')

roleSchema.index({ organizationId: 1, name: 1 }, { unique: true })

export const Role = model<IRole>('Role', roleSchema)
