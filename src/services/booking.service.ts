import type { IBooking } from '../models/Booking'
import { Booking } from '../models/Booking'
import { Lead } from '../models/Lead'
import { User } from '../models/User'
import { Property } from '../models/Property'
import { getNextSequence } from '../utils/autoIncrement'
import { NotFoundError } from '../utils/errors'
import { activeOrgFilter } from '../utils/pagination'

async function nextBookingNumber(organizationId: number) {
  const seq = await getNextSequence(`BookingNumber-${organizationId}`)
  return `BK-${organizationId}-${String(seq).padStart(5, '0')}`
}

async function serializeBooking(booking: IBooking) {
  const [lead, agent, property] = await Promise.all([
    Lead.findById(booking.leadId).lean(),
    User.findById(booking.agentId).lean(),
    booking.propertyId ? Property.findById(booking.propertyId).lean() : null,
  ])

  return {
    id: booking._id,
    bookingNumber: booking.bookingNumber,
    leadId: booking.leadId,
    agentId: booking.agentId,
    status: booking.status,
    totalAmount: booking.totalAmount,
    paidAmount: booking.paidAmount,
    bookingDate: booking.bookingDate.toISOString(),
    notes: booking.notes,
    lead: lead
      ? { id: lead._id, firstName: lead.firstName, lastName: lead.lastName, phone: lead.phone }
      : undefined,
    agent: agent
      ? { id: agent._id, firstName: agent.firstName, lastName: agent.lastName }
      : undefined,
    property: property
      ? {
          id: property._id,
          title: property.title,
          city: property.city,
          price: property.price,
        }
      : undefined,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  }
}

export async function listBookings(
  organizationId: number,
  options: {
    page: number
    limit: number
    status?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  },
) {
  const filter: Record<string, unknown> = activeOrgFilter(organizationId)
  if (options.status) filter.status = options.status.toUpperCase()

  const sortField = options.sortBy || 'createdAt'
  const sortDirection = options.sortOrder === 'asc' ? 1 : -1

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .sort({ [sortField]: sortDirection })
      .skip((options.page - 1) * options.limit)
      .limit(options.limit),
    Booking.countDocuments(filter),
  ])

  const data = await Promise.all(bookings.map(serializeBooking))
  return { bookings: data, total }
}

export async function getBookingById(bookingId: number, organizationId: number) {
  const booking = await Booking.findOne({ _id: bookingId, ...activeOrgFilter(organizationId) })
  if (!booking) throw new NotFoundError('Booking not found')
  return serializeBooking(booking)
}

export async function createBooking(
  organizationId: number,
  agentId: number,
  payload: Record<string, unknown>,
) {
  const bookingNumber = await nextBookingNumber(organizationId)
  const booking = await Booking.create({
    organizationId,
    agentId,
    bookingNumber,
    status: 'PENDING',
    paidAmount: 0,
    bookingDate: new Date(),
    ...payload,
  })
  return serializeBooking(booking)
}

export async function updateBooking(
  bookingId: number,
  organizationId: number,
  updates: Record<string, unknown>,
) {
  const booking = await Booking.findOneAndUpdate(
    { _id: bookingId, ...activeOrgFilter(organizationId) },
    { $set: updates },
    { new: true, runValidators: true },
  )
  if (!booking) throw new NotFoundError('Booking not found')
  return serializeBooking(booking)
}

export async function deleteBooking(bookingId: number, organizationId: number) {
  const booking = await Booking.findOneAndUpdate(
    { _id: bookingId, ...activeOrgFilter(organizationId) },
    { $set: { deletedAt: new Date() } },
    { new: true },
  )
  if (!booking) throw new NotFoundError('Booking not found')
}
