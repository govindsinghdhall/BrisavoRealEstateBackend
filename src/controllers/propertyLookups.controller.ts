import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import {
  createPropertyLookup,
  listPropertyLookups,
  serializePropertyLookup,
} from '../services/propertyLookup.service'
import { success } from '../utils/response'

const createLookupSchema = z.object({
  type: z.string().min(1),
  value: z.string().min(1),
})

export async function listOrganizationPropertyLookups(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.auth) return res.status(401).json({ success: false, message: 'Unauthorized' })
    const type = typeof req.query.type === 'string' ? req.query.type : undefined
    const groups = await listPropertyLookups(req.auth.organizationId, type)
    return success(res, groups)
  } catch (error) {
    next(error)
  }
}

export async function createOrganizationPropertyLookup(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.auth) return res.status(401).json({ success: false, message: 'Unauthorized' })
    const payload = createLookupSchema.parse(req.body)
    const lookup = await createPropertyLookup(
      req.auth.organizationId,
      payload.type,
      payload.value,
    )
    return success(res, serializePropertyLookup(lookup), 'Lookup created', 201)
  } catch (error) {
    next(error)
  }
}
