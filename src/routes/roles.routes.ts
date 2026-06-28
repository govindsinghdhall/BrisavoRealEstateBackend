import { Router } from 'express'
import * as usersController from '../controllers/users.controller'
import { authenticate, requirePermission } from '../middleware/auth'
import { PERMISSIONS } from '../constants/permissions'

const router = Router()

router.use(authenticate)
router.get('/', requirePermission(PERMISSIONS.USERS_READ), usersController.listOrganizationRoles)

export default router
