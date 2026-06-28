import { Router } from 'express'
import * as organizationsController from '../controllers/organizations.controller'
import { authenticate, requirePermission } from '../middleware/auth'
import { PERMISSIONS } from '../constants/permissions'

const router = Router()

router.use(authenticate)

router.get(
  '/current',
  requirePermission(PERMISSIONS.ORGANIZATION_READ),
  organizationsController.getCurrentOrganization,
)
router.patch(
  '/current',
  requirePermission(PERMISSIONS.ORGANIZATION_UPDATE),
  organizationsController.updateCurrentOrganization,
)
router.post(
  '/current/logo',
  requirePermission(PERMISSIONS.ORGANIZATION_UPDATE),
  organizationsController.uploadLogo,
)
router.post(
  '/current/favicon',
  requirePermission(PERMISSIONS.ORGANIZATION_UPDATE),
  organizationsController.uploadFavicon,
)

export default router
