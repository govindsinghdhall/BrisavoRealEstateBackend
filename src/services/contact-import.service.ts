import * as XLSX from 'xlsx'
import {
  createContact,
  findContactByPhone,
  serializeContact,
  updateContact,
} from './contact.service'
import { AppError } from '../utils/errors'

type ImportRow = {
  row: number
  firstName: string
  lastName?: string
  phone: string
  email?: string
  city?: string
}

type PreviewRow = ImportRow & {
  status: 'valid' | 'duplicate' | 'invalid'
  errors: string[]
  existingContactId?: number
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '')
}

function parseRows(buffer: Buffer): ImportRow[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })

  return rawRows.map((raw, index) => {
    const mapped: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(raw)) {
      mapped[normalizeHeader(key)] = value
    }

    const firstName = String(mapped.firstname ?? mapped.first_name ?? '').trim()
    const lastName = String(mapped.lastname ?? mapped.last_name ?? '').trim()
    const phone = String(mapped.phone ?? mapped.mobile ?? mapped.contact ?? '').trim()
    const email = String(mapped.email ?? '').trim()
    const city = String(mapped.city ?? '').trim()

    return {
      row: index + 2,
      firstName,
      lastName: lastName || undefined,
      phone,
      email: email || undefined,
      city: city || undefined,
    }
  })
}

async function evaluateRows(organizationId: number, rows: ImportRow[]): Promise<PreviewRow[]> {
  const previewRows: PreviewRow[] = []

  for (const row of rows) {
    const errors: string[] = []
    if (!row.firstName) errors.push('First name is required')
    if (!row.phone) errors.push('Phone is required')

    if (errors.length) {
      previewRows.push({ ...row, status: 'invalid', errors })
      continue
    }

    const existing = await findContactByPhone(organizationId, row.phone)
    if (existing) {
      previewRows.push({
        ...row,
        status: 'duplicate',
        errors: [],
        existingContactId: existing._id,
      })
      continue
    }

    previewRows.push({ ...row, status: 'valid', errors: [] })
  }

  return previewRows
}

export async function previewContactImport(organizationId: number, buffer: Buffer) {
  const rows = parseRows(buffer).filter(
    (row) => row.firstName || row.lastName || row.phone || row.email || row.city,
  )
  const evaluated = await evaluateRows(organizationId, rows)

  return {
    totalRows: evaluated.length,
    validRows: evaluated.filter((row) => row.status === 'valid').length,
    duplicateRows: evaluated.filter((row) => row.status === 'duplicate').length,
    invalidRows: evaluated.filter((row) => row.status === 'invalid').length,
    rows: evaluated,
  }
}

export async function importContacts(
  organizationId: number,
  buffer: Buffer,
  duplicateAction: 'skip' | 'update',
) {
  const rows = parseRows(buffer).filter(
    (row) => row.firstName || row.lastName || row.phone || row.email || row.city,
  )
  const evaluated = await evaluateRows(organizationId, rows)

  let created = 0
  let updated = 0
  let skipped = 0

  for (const row of evaluated) {
    if (row.status === 'invalid') {
      skipped += 1
      continue
    }

    if (row.status === 'duplicate') {
      if (duplicateAction === 'update' && row.existingContactId) {
        await updateContact(row.existingContactId, organizationId, {
          firstName: row.firstName,
          lastName: row.lastName ?? '',
          email: row.email ?? null,
          city: row.city ?? null,
        })
        updated += 1
      } else {
        skipped += 1
      }
      continue
    }

    const contact = await createContact(organizationId, {
      firstName: row.firstName,
      lastName: row.lastName ?? '',
      phone: row.phone,
      email: row.email ?? null,
      city: row.city ?? null,
    })
    serializeContact(contact)
    created += 1
  }

  return { success: true, created, updated, skipped }
}

export function assertImportFile(file?: { buffer: Buffer; originalname?: string }) {
  if (!file?.buffer?.length) {
    throw new AppError('Import file is required', 400)
  }
  return file
}
