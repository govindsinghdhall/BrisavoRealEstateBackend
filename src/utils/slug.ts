export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

export function organizationNameFromSignup(firstName: string, lastName: string, email: string): string {
  const fullName = `${firstName} ${lastName}`.trim()
  if (fullName) return `${fullName}'s Organization`

  const localPart = email.split('@')[0]
  return `${localPart}'s Organization`
}
