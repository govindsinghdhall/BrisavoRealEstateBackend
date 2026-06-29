import { Organization } from '../models/Organization'
import { NotFoundError } from '../utils/errors'

const DEFAULT_SLUG = process.env.PUBLIC_ORGANIZATION_SLUG || 'durga-property'

let cachedOrganizationId: number | null = null

export async function resolvePublicOrganizationId(): Promise<number> {
  if (cachedOrganizationId) return cachedOrganizationId

  const organization =
    (await Organization.findOne({ slug: DEFAULT_SLUG })) ??
    (await Organization.findOne().sort({ _id: 1 }))

  if (!organization) {
    throw new NotFoundError('Public site organization is not configured')
  }

  cachedOrganizationId = organization._id
  return cachedOrganizationId
}
