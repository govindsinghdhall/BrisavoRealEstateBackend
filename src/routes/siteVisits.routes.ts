import { Router } from 'express'
import * as siteVisitsController from '../controllers/siteVisits.controller'
import { authenticate, requirePermission } from '../middleware/auth'
import { PERMISSIONS } from '../constants/permissions'

const router = Router()

router.use(authenticate)

router.get('/', requirePermission(PERMISSIONS.SITE_VISITS_READ), siteVisitsController.listOrganizationSiteVisits)
router.post('/', requirePermission(PERMISSIONS.SITE_VISITS_CREATE), siteVisitsController.createOrganizationSiteVisit)
router.get('/:id', requirePermission(PERMISSIONS.SITE_VISITS_READ), siteVisitsController.getOrganizationSiteVisit)
router.put('/:id', requirePermission(PERMISSIONS.SITE_VISITS_UPDATE), siteVisitsController.updateOrganizationSiteVisit)
router.delete('/:id', requirePermission(PERMISSIONS.SITE_VISITS_DELETE), siteVisitsController.deleteOrganizationSiteVisit)

export default router
