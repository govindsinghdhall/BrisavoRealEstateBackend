import type { Request, Response, NextFunction } from 'express'
import { listLeadSources, serializeLeadSource } from '../services/leadSource.service'
import { success } from '../utils/response'

export async function listOrganizationLeadSources(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) return res.status(401).json({ success: false, message: 'Unauthorized' })
    const sources = await listLeadSources(req.auth.organizationId)
    return success(res, sources.map(serializeLeadSource))
  } catch (error) {
    next(error)
  }
}
