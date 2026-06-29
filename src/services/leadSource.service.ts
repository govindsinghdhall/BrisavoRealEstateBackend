import { LeadSource } from '../models/LeadSource'

export function serializeLeadSource(source: { _id: number; name: string; type: string }) {
  return {
    id: source._id,
    name: source.name,
    type: source.type,
  }
}

export async function listLeadSources(organizationId: number): Promise<
  Array<{ _id: number; name: string; type: string }>
> {
  return LeadSource.find({ organizationId }).sort({ name: 1 }).lean()
}
