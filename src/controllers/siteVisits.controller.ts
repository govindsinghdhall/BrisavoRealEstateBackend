import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import {
  createSiteVisit,
  deleteSiteVisit,
  getSiteVisitById,
  listSiteVisits,
  updateSiteVisit,
} from '../services/siteVisit.service'
import { buildPaginationMeta, success, successPaginated } from '../utils/response'
import { parseId, parsePagination } from '../utils/pagination'

const siteVisitSchema = z.object({
  leadId: z.coerce.number().int().positive(),
  propertyId: z.coerce.number().int().positive().optional(),
  agentId: z.coerce.number().int().positive(),
  scheduledAt: z.string().datetime().or(z.string().min(1)),
  notes: z.string().optional(),
  status: z.string().optional(),
})

const updateSiteVisitSchema = z.object({
  scheduledAt: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
})

export async function listOrganizationSiteVisits(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) return res.status(401).json({ success: false, message: 'Unauthorized' })
    const { page, limit, sortBy, sortOrder } = parsePagination(req)
    const status = typeof req.query.status === 'string' ? req.query.status : undefined
    const { visits, total } = await listSiteVisits(req.auth.organizationId, {
      page,
      limit,
      status,
      sortBy,
      sortOrder,
    })
    return successPaginated(res, visits, buildPaginationMeta(page, limit, total))
  } catch (error) {
    next(error)
  }
}

export async function getOrganizationSiteVisit(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) return res.status(401).json({ success: false, message: 'Unauthorized' })
    const visit = await getSiteVisitById(parseId(req.params.id), req.auth.organizationId)
    return success(res, visit)
  } catch (error) {
    next(error)
  }
}

export async function createOrganizationSiteVisit(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) return res.status(401).json({ success: false, message: 'Unauthorized' })
    const payload = siteVisitSchema.parse(req.body)
    const visit = await createSiteVisit(req.auth.organizationId, {
      leadId: payload.leadId,
      propertyId: payload.propertyId ?? null,
      agentId: payload.agentId,
      scheduledAt: new Date(payload.scheduledAt),
      notes: payload.notes ?? null,
      status: payload.status?.toUpperCase() ?? 'SCHEDULED',
    })
    return success(res, visit, 'Site visit created', 201)
  } catch (error) {
    next(error)
  }
}

export async function updateOrganizationSiteVisit(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) return res.status(401).json({ success: false, message: 'Unauthorized' })
    const payload = updateSiteVisitSchema.parse(req.body)
    const visit = await updateSiteVisit(parseId(req.params.id), req.auth.organizationId, {
      ...payload,
      scheduledAt: payload.scheduledAt ? new Date(payload.scheduledAt) : undefined,
      status: payload.status?.toUpperCase(),
    })
    return success(res, visit, 'Site visit updated')
  } catch (error) {
    next(error)
  }
}

export async function deleteOrganizationSiteVisit(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) return res.status(401).json({ success: false, message: 'Unauthorized' })
    await deleteSiteVisit(parseId(req.params.id), req.auth.organizationId)
    return success(res, null, 'Site visit deleted')
  } catch (error) {
    next(error)
  }
}
