import type { Request, Response, NextFunction } from 'express'
import {
  getAgentPerformanceReport,
  getLeadConversionReport,
  getRevenueReport,
  getSalesReport,
} from '../services/report.service'
import { success } from '../utils/response'

export async function getLeadConversion(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) return res.status(401).json({ success: false, message: 'Unauthorized' })
    const report = await getLeadConversionReport(req.auth.organizationId)
    return success(res, report)
  } catch (error) {
    next(error)
  }
}

export async function getSales(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) return res.status(401).json({ success: false, message: 'Unauthorized' })
    const report = await getSalesReport(req.auth.organizationId)
    return success(res, report)
  } catch (error) {
    next(error)
  }
}

export async function getRevenue(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) return res.status(401).json({ success: false, message: 'Unauthorized' })
    const report = await getRevenueReport(req.auth.organizationId)
    return success(res, report)
  } catch (error) {
    next(error)
  }
}

export async function getAgentPerformance(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) return res.status(401).json({ success: false, message: 'Unauthorized' })
    const report = await getAgentPerformanceReport(req.auth.organizationId)
    return success(res, report)
  } catch (error) {
    next(error)
  }
}
