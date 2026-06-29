import { Router } from 'express'
import * as reportsController from '../controllers/reports.controller'
import { authenticate, requirePermission } from '../middleware/auth'
import { PERMISSIONS } from '../constants/permissions'

const router = Router()

router.use(authenticate)

router.get(
  '/lead-conversion',
  requirePermission(PERMISSIONS.REPORTS_READ),
  reportsController.getLeadConversion,
)
router.get('/sales', requirePermission(PERMISSIONS.REPORTS_READ), reportsController.getSales)
router.get('/revenue', requirePermission(PERMISSIONS.REPORTS_READ), reportsController.getRevenue)
router.get(
  '/agent-performance',
  requirePermission(PERMISSIONS.REPORTS_READ),
  reportsController.getAgentPerformance,
)

export default router
