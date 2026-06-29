import { PROPERTY_LOOKUP_TYPES, PropertyLookup } from '../models/PropertyLookup'
import { AppError, NotFoundError } from '../utils/errors'
import { activeOrgFilter } from '../utils/pagination'

function normalizeValue(value: string) {
  return value.trim().toLowerCase()
}

export async function listPropertyLookups(organizationId: number, type?: string) {
  const filter: Record<string, unknown> = activeOrgFilter(organizationId)
  if (type) filter.type = type.toUpperCase()

  const lookups = await PropertyLookup.find(filter).sort({ usageCount: -1, value: 1 }).lean()

  const groups = Object.fromEntries(
    PROPERTY_LOOKUP_TYPES.map((lookupType) => [lookupType, [] as string[]]),
  ) as Record<string, string[]>

  for (const lookup of lookups) {
    groups[lookup.type]?.push(lookup.value)
  }

  return groups
}

export async function createPropertyLookup(
  organizationId: number,
  type: string,
  value: string,
) {
  const lookupType = type.toUpperCase()
  if (!PROPERTY_LOOKUP_TYPES.includes(lookupType as (typeof PROPERTY_LOOKUP_TYPES)[number])) {
    throw new AppError('Invalid property lookup type', 400)
  }

  const trimmed = value.trim()
  const normalizedValue = normalizeValue(trimmed)

  const existing = await PropertyLookup.findOne({
    organizationId,
    type: lookupType,
    normalizedValue,
    deletedAt: null,
  })

  if (existing) {
    existing.usageCount += 1
    await existing.save()
    return existing
  }

  return PropertyLookup.create({
    organizationId,
    type: lookupType,
    value: trimmed,
    normalizedValue,
    usageCount: 1,
  })
}

export function serializePropertyLookup(lookup: {
  _id: number
  type: string
  value: string
  usageCount: number
}) {
  return {
    id: lookup._id,
    type: lookup.type,
    value: lookup.value,
    usageCount: lookup.usageCount,
  }
}

export async function getPropertyLookupById(id: number, organizationId: number) {
  const lookup = await PropertyLookup.findOne({ _id: id, ...activeOrgFilter(organizationId) })
  if (!lookup) throw new NotFoundError('Property lookup not found')
  return lookup
}
