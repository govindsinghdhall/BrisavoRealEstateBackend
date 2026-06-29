import { Router } from 'express'
import * as bookingsController from '../controllers/bookings.controller'
import { authenticate, requirePermission } from '../middleware/auth'
import { PERMISSIONS } from '../constants/permissions'

const router = Router()

router.use(authenticate)

router.get('/', requirePermission(PERMISSIONS.BOOKINGS_READ), bookingsController.listOrganizationBookings)
router.post('/', requirePermission(PERMISSIONS.BOOKINGS_CREATE), bookingsController.createOrganizationBooking)
router.get('/:id', requirePermission(PERMISSIONS.BOOKINGS_READ), bookingsController.getOrganizationBooking)
router.put('/:id', requirePermission(PERMISSIONS.BOOKINGS_UPDATE), bookingsController.updateOrganizationBooking)
router.delete('/:id', requirePermission(PERMISSIONS.BOOKINGS_DELETE), bookingsController.deleteOrganizationBooking)

export default router
