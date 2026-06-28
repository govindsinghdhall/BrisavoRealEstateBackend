import { DEFAULT_ROLES, ROLE_PERMISSIONS } from '../constants/permissions'
import { LeadSource } from '../models/LeadSource'
import { Organization, type IOrganization } from '../models/Organization'
import { Role } from '../models/Role'
import { organizationNameFromSignup, slugify } from '../utils/slug'

const DEFAULT_LEAD_SOURCES = [
  { name: 'Website', type: 'WEBSITE' },
  { name: 'Walk-in', type: 'WALK_IN' },
  { name: 'Referral', type: 'REFERRAL' },
  { name: 'Social Media', type: 'SOCIAL' },
  { name: 'Phone', type: 'PHONE' },
]

async function generateUniqueSlug(baseName: string): Promise<string> {
  const base = slugify(baseName) || 'organization'
  let slug = base
  let counter = 1

  while (await Organization.exists({ slug })) {
    slug = `${base}-${counter}`
    counter += 1
  }

  return slug
}

export async function createOrganizationForSignup(input: {
  firstName: string
  lastName: string
  email: string
  phone?: string
}): Promise<IOrganization> {
  const name = organizationNameFromSignup(input.firstName, input.lastName, input.email)
  const slug = await generateUniqueSlug(name)

  const organization = await Organization.create({
    name,
    slug,
    email: input.email.toLowerCase(),
    phone: input.phone ?? null,
    settings: {
      tagline: 'Your real estate business, organized.',
    },
  })

  await seedOrganizationDefaults(organization._id)

  return organization
}

export async function seedOrganizationDefaults(organizationId: number) {
  await Promise.all(
    DEFAULT_ROLES.map((roleName) =>
      Role.create({
        organizationId,
        name: roleName,
        permissions: ROLE_PERMISSIONS[roleName],
        isSystem: true,
      }),
    ),
  )

  await Promise.all(
    DEFAULT_LEAD_SOURCES.map((source) =>
      LeadSource.create({
        organizationId,
        name: source.name,
        type: source.type,
        isSystem: true,
      }),
    ),
  )
}

export async function getOrganizationById(organizationId: number) {
  const organization = await Organization.findById(organizationId)
  if (!organization) {
    const { NotFoundError } = await import('../utils/errors')
    throw new NotFoundError('Organization not found')
  }
  return organization
}

export function serializeOrganization(organization: IOrganization) {
  return {
    id: organization._id,
    name: organization.name,
    slug: organization.slug,
    logo: organization.logo,
    email: organization.email,
    phone: organization.phone,
    address: organization.address,
    settings: organization.settings,
  }
}
