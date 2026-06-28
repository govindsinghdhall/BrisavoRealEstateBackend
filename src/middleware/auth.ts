import type { NextFunction, Request, Response } from 'express'
import { UnauthorizedError } from '../utils/errors'
import { verifyAccessToken } from '../utils/jwt'

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or invalid authorization header'))
  }

  try {
    const token = header.slice(7)
    req.auth = verifyAccessToken(token)
    next()
  } catch {
    next(new UnauthorizedError('Invalid or expired token'))
  }
}

export function requirePermission(...permissions: string[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.auth) {
      return next(new UnauthorizedError())
    }

    const { Role } = await import('../models/Role')
    const role = await Role.findOne({
      _id: req.auth.roleId,
      organizationId: req.auth.organizationId,
    }).lean()

    if (!role) {
      return next(new UnauthorizedError('Role not found'))
    }

    const hasPermission = permissions.every((permission) =>
      (role.permissions as string[]).includes(permission),
    )
    if (!hasPermission) {
      const { ForbiddenError } = await import('../utils/errors')
      return next(new ForbiddenError('Insufficient permissions'))
    }

    next()
  }
}
