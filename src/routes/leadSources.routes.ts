import { Router } from 'express'
import * as leadSourcesController from '../controllers/leadSources.controller'
import { authenticate, requirePermission } from '../middleware/auth'
import { PERMISSIONS } from '../constants/permissions'

const router = Router()

router.use(authenticate)
router.get('/', requirePermission(PERMISSIONS.LEADS_READ), leadSourcesController.listOrganizationLeadSources)

export default router
