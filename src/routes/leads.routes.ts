import { Router } from 'express'
import * as leadsController from '../controllers/leads.controller'
import { authenticate, requirePermission } from '../middleware/auth'
import { PERMISSIONS } from '../constants/permissions'

const router = Router()

router.use(authenticate)

router.get('/', requirePermission(PERMISSIONS.LEADS_READ), leadsController.listOrganizationLeads)
router.post('/', requirePermission(PERMISSIONS.LEADS_CREATE), leadsController.createOrganizationLead)
router.get('/:id/timeline', requirePermission(PERMISSIONS.LEADS_READ), leadsController.getOrganizationLeadTimeline)
router.post('/:id/notes', requirePermission(PERMISSIONS.LEADS_UPDATE), leadsController.addOrganizationLeadNote)
router.get('/:id', requirePermission(PERMISSIONS.LEADS_READ), leadsController.getOrganizationLead)
router.put('/:id', requirePermission(PERMISSIONS.LEADS_UPDATE), leadsController.updateOrganizationLead)
router.delete('/:id', requirePermission(PERMISSIONS.LEADS_DELETE), leadsController.deleteOrganizationLead)

export default router
