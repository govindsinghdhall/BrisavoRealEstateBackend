import type { ISiteVisit } from '../models/SiteVisit'
import { SiteVisit } from '../models/SiteVisit'
import { Lead } from '../models/Lead'
import { User } from '../models/User'
import { Property } from '../models/Property'
import { NotFoundError } from '../utils/errors'
import { activeOrgFilter } from '../utils/pagination'

async function serializeSiteVisit(visit: ISiteVisit) {
  const [lead, agent, property] = await Promise.all([
    Lead.findById(visit.leadId).lean(),
    User.findById(visit.agentId).lean(),
    visit.propertyId ? Property.findById(visit.propertyId).lean() : null,
  ])

  return {
    id: visit._id,
    leadId: visit.leadId,
    agentId: visit.agentId,
    propertyId: visit.propertyId,
    scheduledAt: visit.scheduledAt.toISOString(),
    status: visit.status,
    notes: visit.notes,
    feedback: visit.feedback,
    lead: lead
      ? { id: lead._id, firstName: lead.firstName, lastName: lead.lastName, phone: lead.phone }
      : undefined,
    agent: agent
      ? { id: agent._id, firstName: agent.firstName, lastName: agent.lastName, email: agent.email }
      : undefined,
    property: property ? { id: property._id, title: property.title } : undefined,
    createdAt: visit.createdAt.toISOString(),
    updatedAt: visit.updatedAt.toISOString(),
  }
}

export async function listSiteVisits(
  organizationId: number,
  options: {
    page: number
    limit: number
    status?: string
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  },
) {
  const filter: Record<string, unknown> = activeOrgFilter(organizationId)
  if (options.status) filter.status = options.status.toUpperCase()

  const sortField = options.sortBy || 'scheduledAt'
  const sortDirection = options.sortOrder === 'asc' ? 1 : -1

  const [visits, total] = await Promise.all([
    SiteVisit.find(filter)
      .sort({ [sortField]: sortDirection })
      .skip((options.page - 1) * options.limit)
      .limit(options.limit),
    SiteVisit.countDocuments(filter),
  ])

  const data = await Promise.all(visits.map(serializeSiteVisit))
  return { visits: data, total }
}

export async function getSiteVisitById(visitId: number, organizationId: number) {
  const visit = await SiteVisit.findOne({ _id: visitId, ...activeOrgFilter(organizationId) })
  if (!visit) throw new NotFoundError('Site visit not found')
  return serializeSiteVisit(visit)
}

export async function createSiteVisit(organizationId: number, payload: Record<string, unknown>) {
  const visit = await SiteVisit.create({
    organizationId,
    status: 'SCHEDULED',
    ...payload,
  })
  return serializeSiteVisit(visit)
}

export async function updateSiteVisit(
  visitId: number,
  organizationId: number,
  updates: Record<string, unknown>,
) {
  const visit = await SiteVisit.findOneAndUpdate(
    { _id: visitId, ...activeOrgFilter(organizationId) },
    { $set: updates },
    { new: true, runValidators: true },
  )
  if (!visit) throw new NotFoundError('Site visit not found')
  return serializeSiteVisit(visit)
}

export async function deleteSiteVisit(visitId: number, organizationId: number) {
  const visit = await SiteVisit.findOneAndUpdate(
    { _id: visitId, ...activeOrgFilter(organizationId) },
    { $set: { deletedAt: new Date() } },
    { new: true },
  )
  if (!visit) throw new NotFoundError('Site visit not found')
}
