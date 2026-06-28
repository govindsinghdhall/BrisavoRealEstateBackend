import type { IUser } from '../models/User'
import { User } from '../models/User'
import { Role } from '../models/Role'
import { NotFoundError } from '../utils/errors'

export async function serializeUser(user: IUser) {
  const role = await Role.findById(user.roleId).lean()

  return {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    avatar: user.avatar,
    isActive: user.isActive,
    roleId: user.roleId,
    role: role ? { id: role._id, name: role.name } : undefined,
    permissions: role?.permissions ?? [],
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}

export async function getUserById(userId: number, organizationId: number) {
  const user = await User.findOne({ _id: userId, organizationId })
  if (!user) {
    throw new NotFoundError('User not found')
  }
  return user
}

export async function listUsers(
  organizationId: number,
  options: { page: number; limit: number; search?: string },
) {
  const filter: Record<string, unknown> = { organizationId }

  if (options.search) {
    const regex = new RegExp(options.search, 'i')
    filter.$or = [
      { firstName: regex },
      { lastName: regex },
      { email: regex },
      { phone: regex },
    ]
  }

  const skip = (options.page - 1) * options.limit
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(options.limit),
    User.countDocuments(filter),
  ])

  return { users, total }
}

export async function updateUser(
  userId: number,
  organizationId: number,
  payload: {
    email?: string
    firstName?: string
    lastName?: string
    phone?: string | null
    roleId?: number
    isActive?: boolean
    passwordHash?: string
  },
) {
  const user = await getUserById(userId, organizationId)

  if (payload.email && payload.email !== user.email) {
    const existing = await User.findOne({ email: payload.email.toLowerCase() })
    if (existing) {
      const { ConflictError } = await import('../utils/errors')
      throw new ConflictError('Email is already in use')
    }
    user.email = payload.email.toLowerCase()
  }

  if (payload.firstName !== undefined) user.firstName = payload.firstName
  if (payload.lastName !== undefined) user.lastName = payload.lastName
  if (payload.phone !== undefined) user.phone = payload.phone
  if (payload.roleId !== undefined) user.roleId = payload.roleId
  if (payload.isActive !== undefined) user.isActive = payload.isActive
  if (payload.passwordHash) user.passwordHash = payload.passwordHash

  await user.save()
  return user
}

export async function deleteUser(userId: number, organizationId: number) {
  const user = await getUserById(userId, organizationId)
  await user.deleteOne()
}
