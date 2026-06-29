import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import {
  addLeadNote,
  createLead,
  deleteLead,
  getLeadById,
  getLeadTimeline,
  listLeads,
  updateLead,
} from '../services/lead.service'
import { buildPaginationMeta, success, successPaginated } from '../utils/response'
import { parseId, parsePagination } from '../utils/pagination'

const createLeadSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(1),
  sourceId: z.coerce.number().int().positive(),
  budget: z.coerce.number().optional(),
  city: z.string().optional(),
  requirements: z.string().optional(),
  assignedToId: z.coerce.number().int().positive().optional(),
  status: z.string().optional(),
})

const updateLeadSchema = createLeadSchema.partial()

const noteSchema = z.object({
  content: z.string().min(1),
})

export async function listOrganizationLeads(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) return res.status(401).json({ success: false, message: 'Unauthorized' })
    const { page, limit, search, sortBy, sortOrder } = parsePagination(req)
    const status = typeof req.query.status === 'string' ? req.query.status : undefined
    const { leads, total } = await listLeads(req.auth.organizationId, {
      page,
      limit,
      search,
      status,
      sortBy,
      sortOrder,
    })
    return successPaginated(res, leads, buildPaginationMeta(page, limit, total))
  } catch (error) {
    next(error)
  }
}

export async function getOrganizationLead(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) return res.status(401).json({ success: false, message: 'Unauthorized' })
    const lead = await getLeadById(parseId(req.params.id), req.auth.organizationId)
    return success(res, lead)
  } catch (error) {
    next(error)
  }
}

export async function createOrganizationLead(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) return res.status(401).json({ success: false, message: 'Unauthorized' })
    const payload = createLeadSchema.parse(req.body)
    const lead = await createLead(req.auth.organizationId, req.auth.userId, {
      ...payload,
      email: payload.email || null,
      lastName: payload.lastName ?? '',
      status: payload.status?.toUpperCase() ?? 'NEW',
    })
    return success(res, lead, 'Lead created', 201)
  } catch (error) {
    next(error)
  }
}

export async function updateOrganizationLead(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) return res.status(401).json({ success: false, message: 'Unauthorized' })
    const payload = updateLeadSchema.parse(req.body)
    const lead = await updateLead(parseId(req.params.id), req.auth.organizationId, req.auth.userId, {
      ...payload,
      email: payload.email === '' ? null : payload.email,
      status: payload.status?.toUpperCase(),
    })
    return success(res, lead, 'Lead updated')
  } catch (error) {
    next(error)
  }
}

export async function deleteOrganizationLead(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) return res.status(401).json({ success: false, message: 'Unauthorized' })
    await deleteLead(parseId(req.params.id), req.auth.organizationId)
    return success(res, null, 'Lead deleted')
  } catch (error) {
    next(error)
  }
}

export async function getOrganizationLeadTimeline(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) return res.status(401).json({ success: false, message: 'Unauthorized' })
    const timeline = await getLeadTimeline(parseId(req.params.id), req.auth.organizationId)
    return success(res, timeline)
  } catch (error) {
    next(error)
  }
}

export async function addOrganizationLeadNote(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) return res.status(401).json({ success: false, message: 'Unauthorized' })
    const { content } = noteSchema.parse(req.body)
    const note = await addLeadNote(
      parseId(req.params.id),
      req.auth.organizationId,
      req.auth.userId,
      content,
    )
    return success(res, note, 'Note added', 201)
  } catch (error) {
    next(error)
  }
}
