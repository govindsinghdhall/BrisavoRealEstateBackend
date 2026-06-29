import { Contact, type IContact } from '../models/Contact'
import { Lead } from '../models/Lead'
import { LeadSource } from '../models/LeadSource'
import { NotFoundError } from '../utils/errors'
import { activeOrgFilter } from '../utils/pagination'

async function loadSource(sourceId: number | null | undefined) {
  if (!sourceId) return null
  return LeadSource.findById(sourceId).lean()
}

export function serializeContact(
  contact: IContact,
  extras?: { leadsCount?: number; source?: { _id: number; name: string; type: string } | null },
) {
  return {
    id: contact._id,
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    phone: contact.phone,
    alternatePhone: contact.alternatePhone,
    address: contact.address,
    city: contact.city,
    state: contact.state,
    pincode: contact.pincode,
    sourceId: contact.sourceId,
    source: extras?.source ? { id: extras.source._id, name: extras.source.name, type: extras.source.type } : undefined,
    _count: extras?.leadsCount !== undefined ? { leads: extras.leadsCount } : undefined,
    createdAt: contact.createdAt.toISOString(),
    updatedAt: contact.updatedAt.toISOString(),
  }
}

export async function listContacts(
  organizationId: number,
  options: {
    page: number
    limit: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  },
) {
  const filter: Record<string, unknown> = activeOrgFilter(organizationId)

  if (options.search) {
    const pattern = new RegExp(options.search, 'i')
    filter.$or = [
      { firstName: pattern },
      { lastName: pattern },
      { email: pattern },
      { phone: pattern },
      { city: pattern },
    ]
  }

  const sortField = options.sortBy || 'createdAt'
  const sortDirection = options.sortOrder === 'asc' ? 1 : -1

  const [contacts, total] = await Promise.all([
    Contact.find(filter)
      .sort({ [sortField]: sortDirection })
      .skip((options.page - 1) * options.limit)
      .limit(options.limit),
    Contact.countDocuments(filter),
  ])

  const serialized = await Promise.all(
    contacts.map(async (contact) => {
      const [leadsCount, source] = await Promise.all([
        Lead.countDocuments({ organizationId, contactId: contact._id, deletedAt: null }),
        loadSource(contact.sourceId),
      ])
      return serializeContact(contact, { leadsCount, source })
    }),
  )

  return { contacts: serialized, total }
}

export async function getContactById(contactId: number, organizationId: number) {
  const contact = await Contact.findOne({ _id: contactId, ...activeOrgFilter(organizationId) })
  if (!contact) throw new NotFoundError('Contact not found')

  const source = await loadSource(contact.sourceId)
  const leads = await Lead.find({ organizationId, contactId: contact._id, deletedAt: null })
    .sort({ createdAt: -1 })
    .lean()

  const leadSources = await LeadSource.find({
    _id: { $in: leads.map((lead) => lead.sourceId) },
  }).lean()
  const sourceMap = Object.fromEntries(leadSources.map((item) => [item._id, item]))

  const leadSummaries = leads.map((lead) => ({
    id: lead._id,
    status: lead.status,
    budget: lead.budget,
    requirements: lead.requirements,
    source: sourceMap[lead.sourceId]
      ? { id: sourceMap[lead.sourceId]._id, name: sourceMap[lead.sourceId].name }
      : undefined,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  }))

  return {
    ...serializeContact(contact, { leadsCount: leads.length, source }),
    leads: leadSummaries,
  }
}

export async function createContact(organizationId: number, payload: Record<string, unknown>) {
  return Contact.create({ organizationId, ...payload })
}

export async function updateContact(
  contactId: number,
  organizationId: number,
  updates: Record<string, unknown>,
) {
  const contact = await Contact.findOneAndUpdate(
    { _id: contactId, ...activeOrgFilter(organizationId) },
    { $set: updates },
    { new: true, runValidators: true },
  )
  if (!contact) throw new NotFoundError('Contact not found')
  const source = await loadSource(contact.sourceId)
  return serializeContact(contact, { source })
}

export async function deleteContact(contactId: number, organizationId: number) {
  const contact = await Contact.findOneAndUpdate(
    { _id: contactId, ...activeOrgFilter(organizationId) },
    { $set: { deletedAt: new Date() } },
    { new: true },
  )
  if (!contact) throw new NotFoundError('Contact not found')
}

export async function findContactByPhone(organizationId: number, phone: string) {
  return Contact.findOne({ organizationId, phone, deletedAt: null })
}
