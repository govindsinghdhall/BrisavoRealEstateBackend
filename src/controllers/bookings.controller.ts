import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import {
  createBooking,
  deleteBooking,
  getBookingById,
  listBookings,
  updateBooking,
} from '../services/booking.service'
import { buildPaginationMeta, success, successPaginated } from '../utils/response'
import { parseId, parsePagination } from '../utils/pagination'

const bookingSchema = z.object({
  leadId: z.coerce.number().int().positive(),
  propertyId: z.coerce.number().int().positive().optional(),
  totalAmount: z.coerce.number().nonnegative(),
  notes: z.string().optional(),
  status: z.string().optional(),
})

const updateBookingSchema = z.object({
  status: z.string().optional(),
  notes: z.string().optional(),
})

export async function listOrganizationBookings(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) return res.status(401).json({ success: false, message: 'Unauthorized' })
    const { page, limit, sortBy, sortOrder } = parsePagination(req)
    const status = typeof req.query.status === 'string' ? req.query.status : undefined
    const { bookings, total } = await listBookings(req.auth.organizationId, {
      page,
      limit,
      status,
      sortBy,
      sortOrder,
    })
    return successPaginated(res, bookings, buildPaginationMeta(page, limit, total))
  } catch (error) {
    next(error)
  }
}

export async function getOrganizationBooking(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) return res.status(401).json({ success: false, message: 'Unauthorized' })
    const booking = await getBookingById(parseId(req.params.id), req.auth.organizationId)
    return success(res, booking)
  } catch (error) {
    next(error)
  }
}

export async function createOrganizationBooking(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) return res.status(401).json({ success: false, message: 'Unauthorized' })
    const payload = bookingSchema.parse(req.body)
    const booking = await createBooking(req.auth.organizationId, req.auth.userId, {
      leadId: payload.leadId,
      propertyId: payload.propertyId ?? null,
      totalAmount: payload.totalAmount,
      notes: payload.notes ?? null,
      status: payload.status?.toUpperCase() ?? 'PENDING',
    })
    return success(res, booking, 'Booking created', 201)
  } catch (error) {
    next(error)
  }
}

export async function updateOrganizationBooking(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) return res.status(401).json({ success: false, message: 'Unauthorized' })
    const payload = updateBookingSchema.parse(req.body)
    const booking = await updateBooking(parseId(req.params.id), req.auth.organizationId, {
      ...payload,
      status: payload.status?.toUpperCase(),
    })
    return success(res, booking, 'Booking updated')
  } catch (error) {
    next(error)
  }
}

export async function deleteOrganizationBooking(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) return res.status(401).json({ success: false, message: 'Unauthorized' })
    await deleteBooking(parseId(req.params.id), req.auth.organizationId)
    return success(res, null, 'Booking deleted')
  } catch (error) {
    next(error)
  }
}
