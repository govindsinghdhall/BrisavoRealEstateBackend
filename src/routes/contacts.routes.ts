import { Router } from 'express'
import * as contactsController from '../controllers/contacts.controller'
import { authenticate, requirePermission } from '../middleware/auth'
import { upload } from '../middleware/upload'
import { PERMISSIONS } from '../constants/permissions'

const router = Router()

router.use(authenticate)

router.post(
  '/import/preview',
  requirePermission(PERMISSIONS.CONTACTS_CREATE),
  upload.single('file'),
  contactsController.previewOrganizationContactImport,
)
router.post(
  '/import',
  requirePermission(PERMISSIONS.CONTACTS_CREATE),
  upload.single('file'),
  contactsController.importOrganizationContacts,
)
router.get('/', requirePermission(PERMISSIONS.CONTACTS_READ), contactsController.listOrganizationContacts)
router.post('/', requirePermission(PERMISSIONS.CONTACTS_CREATE), contactsController.createOrganizationContact)
router.get('/:id', requirePermission(PERMISSIONS.CONTACTS_READ), contactsController.getOrganizationContact)
router.put('/:id', requirePermission(PERMISSIONS.CONTACTS_UPDATE), contactsController.updateOrganizationContact)
router.delete('/:id', requirePermission(PERMISSIONS.CONTACTS_DELETE), contactsController.deleteOrganizationContact)

export default router
