import { Schema, model, type Document } from 'mongoose'
import { applyAutoIncrement } from '../utils/autoIncrement'

export interface IUser extends Document<number> {
  organizationId: number
  roleId: number
  email: string
  passwordHash: string
  firstName: string
  lastName: string
  phone: string | null
  avatar: string | null
  isActive: boolean
  lastLoginAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    _id: { type: Number },
    organizationId: { type: Number, ref: 'Organization', required: true, index: true },
    roleId: { type: Number, ref: 'Role', required: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    passwordHash: { type: String, required: true, select: false },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, default: null, trim: true },
    avatar: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
)

applyAutoIncrement(userSchema, 'User')

userSchema.index({ organizationId: 1, email: 1 })

export const User = model<IUser>('User', userSchema)
