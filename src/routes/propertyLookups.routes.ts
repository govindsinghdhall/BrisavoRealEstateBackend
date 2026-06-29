import { Router } from 'express'
import * as propertyLookupsController from '../controllers/propertyLookups.controller'
import { authenticate, requirePermission } from '../middleware/auth'
import { PERMISSIONS } from '../constants/permissions'

const router = Router()

router.use(authenticate)

router.get(
  '/',
  requirePermission(PERMISSIONS.PROPERTIES_READ),
  propertyLookupsController.listOrganizationPropertyLookups,
)
router.post(
  '/',
  requirePermission(PERMISSIONS.PROPERTIES_CREATE),
  propertyLookupsController.createOrganizationPropertyLookup,
)

export default router
