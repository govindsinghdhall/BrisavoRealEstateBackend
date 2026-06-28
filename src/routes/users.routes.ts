import { Router } from 'express'
import * as usersController from '../controllers/users.controller'
import { authenticate, requirePermission } from '../middleware/auth'
import { PERMISSIONS } from '../constants/permissions'

const router = Router()

router.use(authenticate)

router.get('/', requirePermission(PERMISSIONS.USERS_READ), usersController.listOrganizationUsers)
router.post('/', requirePermission(PERMISSIONS.USERS_CREATE), usersController.createOrganizationUser)
router.get('/:id', requirePermission(PERMISSIONS.USERS_READ), usersController.getOrganizationUser)
router.put('/:id', requirePermission(PERMISSIONS.USERS_UPDATE), usersController.updateOrganizationUser)
router.delete('/:id', requirePermission(PERMISSIONS.USERS_DELETE), usersController.deleteOrganizationUser)

export default router
