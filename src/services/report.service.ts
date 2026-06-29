import { Booking } from '../models/Booking'
import { Lead } from '../models/Lead'
import { LeadSource } from '../models/LeadSource'
import { SiteVisit } from '../models/SiteVisit'
import { User } from '../models/User'
import { activeOrgFilter } from '../utils/pagination'

export async function getLeadConversionReport(organizationId: number): Promise<{
  total: number
  conversionRate: string
  byStatus: { status: string; _count: number }[]
  bySource: { source: { _id: number; name?: string; type?: string } | { id: number }; count: number }[]
}> {
  const filter = activeOrgFilter(organizationId)

  const [byStatus, bySource, total] = await Promise.all([
    Lead.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', _count: '$count' } },
    ]),
    Lead.aggregate([
      { $match: filter },
      { $group: { _id: '$sourceId', count: { $sum: 1 } } },
    ]),
    Lead.countDocuments(filter),
  ])

  const sources = await LeadSource.find({ organizationId }).lean()
  const sourceMap = Object.fromEntries(sources.map((source) => [source._id, source]))
  const wonCount = byStatus.find((item) => item.status === 'WON')?._count ?? 0
  const conversionRate = total > 0 ? `${((wonCount / total) * 100).toFixed(2)}%` : '0%'

  return {
    total,
    conversionRate,
    byStatus,
    bySource: bySource.map((item) => ({
      source: sourceMap[item._id] ?? { id: item._id },
      count: item.count,
    })),
  }
}

export async function getSalesReport(organizationId: number) {
  const filter = activeOrgFilter(organizationId)

  const [byStatus, totalBookings, revenueAgg] = await Promise.all([
    Booking.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          paidAmount: { $sum: '$paidAmount' },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          _count: '$count',
          _sum: { totalAmount: '$totalAmount', paidAmount: '$paidAmount' },
        },
      },
    ]),
    Booking.countDocuments(filter),
    Booking.aggregate([
      { $match: { ...filter, status: { $ne: 'CANCELLED' } } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' },
          paidAmount: { $sum: '$paidAmount' },
        },
      },
    ]),
  ])

  const totals = revenueAgg[0] ?? { totalAmount: 0, paidAmount: 0 }

  return {
    totalBookings,
    totalRevenue: totals.totalAmount ?? 0,
    totalCollected: totals.paidAmount ?? 0,
    pendingAmount: (totals.totalAmount ?? 0) - (totals.paidAmount ?? 0),
    byStatus,
  }
}

export async function getRevenueReport(organizationId: number) {
  const filter = { ...activeOrgFilter(organizationId), status: { $ne: 'CANCELLED' } }
  const bookings = await Booking.find(filter).sort({ bookingDate: -1 }).limit(20).lean()
  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.paidAmount, 0)

  return {
    totalRevenue,
    paymentCount: bookings.length,
    byMethod: [],
    recentPayments: bookings.map((booking) => ({
      id: booking._id,
      amount: booking.paidAmount,
      bookingNumber: booking.bookingNumber,
      paidAt: booking.bookingDate,
    })),
  }
}

export async function getAgentPerformanceReport(organizationId: number) {
  const agents = await User.find({ organizationId, isActive: true }).lean()
  const leadFilter = activeOrgFilter(organizationId)
  const bookingFilter = activeOrgFilter(organizationId)

  const performance = await Promise.all(
    agents.map(async (agent) => {
      const [totalLeads, wonLeads, totalBookings, totalSiteVisits, revenueAgg] =
        await Promise.all([
          Lead.countDocuments({ ...leadFilter, assignedToId: agent._id }),
          Lead.countDocuments({ ...leadFilter, assignedToId: agent._id, status: 'WON' }),
          Booking.countDocuments({ ...bookingFilter, agentId: agent._id }),
          SiteVisit.countDocuments({ ...activeOrgFilter(organizationId), agentId: agent._id }),
          Booking.aggregate([
            {
              $match: {
                ...bookingFilter,
                agentId: agent._id,
                status: { $ne: 'CANCELLED' },
              },
            },
            { $group: { _id: null, paidAmount: { $sum: '$paidAmount' } } },
          ]),
        ])

      const revenue = revenueAgg[0]?.paidAmount ?? 0

      return {
        agent: {
          id: agent._id,
          name: `${agent.firstName} ${agent.lastName}`,
          email: agent.email,
        },
        totalLeads,
        wonLeads,
        conversionRate:
          totalLeads > 0 ? `${((wonLeads / totalLeads) * 100).toFixed(2)}%` : '0%',
        totalBookings,
        totalSiteVisits,
        revenue,
      }
    }),
  )

  return performance.sort((a, b) => b.revenue - a.revenue)
}
