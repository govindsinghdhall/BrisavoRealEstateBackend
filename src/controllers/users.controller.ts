import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { Role } from '../models/Role'
import { User } from '../models/User'
import {
  deleteUser,
  getUserById,
  listUsers,
  serializeUser,
  updateUser,
} from '../services/user.service'
import { hashPassword } from '../utils/password'
import { buildPaginationMeta, success, successPaginated } from '../utils/response'
import { AppError, ConflictError } from '../utils/errors'

function paramId(value: string | string[]): number {
  const raw = Array.isArray(value) ? value[0] : value
  const id = Number(raw)

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('Invalid ID', 400)
  }

  return id
}

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  roleId: z.coerce.number().int().positive(),
})

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().nullable().optional(),
  roleId: z.coerce.number().int().positive().optional(),
  isActive: z.boolean().optional(),
})

export async function listOrganizationUsers(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
    const search = typeof req.query.search === 'string' ? req.query.search : undefined

    const { users, total } = await listUsers(req.auth.organizationId, { page, limit, search })
    const data = await Promise.all(users.map((user) => serializeUser(user)))

    return successPaginated(res, data, buildPaginationMeta(page, limit, total))
  } catch (error) {
    next(error)
  }
}

export async function getOrganizationUser(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const user = await getUserById(paramId(req.params.id), req.auth.organizationId)
    return success(res, await serializeUser(user))
  } catch (error) {
    next(error)
  }
}

export async function createOrganizationUser(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const payload = createUserSchema.parse(req.body)
    const role = await Role.findOne({
      _id: payload.roleId,
      organizationId: req.auth.organizationId,
    })

    if (!role) {
      throw new AppError('Invalid role for this organization', 400)
    }

    const existing = await User.findOne({ email: payload.email.toLowerCase() })
    if (existing) {
      throw new ConflictError('Email is already in use')
    }

    const passwordHash = await hashPassword(payload.password)
    const user = await User.create({
      organizationId: req.auth.organizationId,
      roleId: role._id,
      email: payload.email.toLowerCase(),
      passwordHash,
      firstName: payload.firstName,
      lastName: payload.lastName,
      phone: payload.phone ?? null,
      isActive: true,
    })

    return success(res, await serializeUser(user), 'User created', 201)
  } catch (error) {
    next(error)
  }
}

export async function updateOrganizationUser(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const payload = updateUserSchema.parse(req.body)

    if (payload.roleId) {
      const role = await Role.findOne({
        _id: payload.roleId,
        organizationId: req.auth.organizationId,
      })
      if (!role) {
        throw new AppError('Invalid role for this organization', 400)
      }
    }

    const updates: Parameters<typeof updateUser>[2] = {
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      phone: payload.phone,
      roleId: payload.roleId,
      isActive: payload.isActive,
    }

    if (payload.password) {
      updates.passwordHash = await hashPassword(payload.password)
    }

    const user = await updateUser(paramId(req.params.id), req.auth.organizationId, updates)
    return success(res, await serializeUser(user), 'User updated')
  } catch (error) {
    next(error)
  }
}

export async function deleteOrganizationUser(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    if (paramId(req.params.id) === req.auth.userId) {
      throw new AppError('You cannot delete your own account', 400)
    }

    await deleteUser(paramId(req.params.id), req.auth.organizationId)
    return success(res, null, 'User deleted')
  } catch (error) {
    next(error)
  }
}

export async function listOrganizationRoles(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 100))

    const roles = await Role.find({ organizationId: req.auth.organizationId }).sort({ name: 1 })
    const data = roles.map((role) => ({
      id: role._id,
      name: role.name,
    }))

    return successPaginated(
      res,
      data.slice((page - 1) * limit, page * limit),
      buildPaginationMeta(page, limit, roles.length),
    )
  } catch (error) {
    next(error)
  }
}
