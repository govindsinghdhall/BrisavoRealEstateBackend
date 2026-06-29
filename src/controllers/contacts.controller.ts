import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import {
  assertImportFile,
  importContacts,
  previewContactImport,
} from '../services/contact-import.service'
import {
  createContact,
  deleteContact,
  getContactById,
  listContacts,
  serializeContact,
  updateContact,
} from '../services/contact.service'
import { buildPaginationMeta, success, successPaginated } from '../utils/response'
import { parseId, parsePagination } from '../utils/pagination'

const contactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  phone: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  alternatePhone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  sourceId: z.coerce.number().int().positive().optional(),
})

export async function listOrganizationContacts(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) return res.status(401).json({ success: false, message: 'Unauthorized' })
    const { page, limit, search, sortBy, sortOrder } = parsePagination(req)
    const { contacts, total } = await listContacts(req.auth.organizationId, {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    })
    return successPaginated(res, contacts, buildPaginationMeta(page, limit, total))
  } catch (error) {
    next(error)
  }
}

export async function getOrganizationContact(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) return res.status(401).json({ success: false, message: 'Unauthorized' })
    const contact = await getContactById(parseId(req.params.id), req.auth.organizationId)
    return success(res, contact)
  } catch (error) {
    next(error)
  }
}

export async function createOrganizationContact(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) return res.status(401).json({ success: false, message: 'Unauthorized' })
    const payload = contactSchema.parse(req.body)
    const contact = await createContact(req.auth.organizationId, {
      ...payload,
      lastName: payload.lastName ?? '',
      email: payload.email || null,
    })
    return success(res, serializeContact(contact), 'Contact created', 201)
  } catch (error) {
    next(error)
  }
}

export async function updateOrganizationContact(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) return res.status(401).json({ success: false, message: 'Unauthorized' })
    const payload = contactSchema.partial().parse(req.body)
    const contact = await updateContact(parseId(req.params.id), req.auth.organizationId, {
      ...payload,
      email: payload.email === '' ? null : payload.email,
    })
    return success(res, contact, 'Contact updated')
  } catch (error) {
    next(error)
  }
}

export async function deleteOrganizationContact(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) return res.status(401).json({ success: false, message: 'Unauthorized' })
    await deleteContact(parseId(req.params.id), req.auth.organizationId)
    return success(res, null, 'Contact deleted')
  } catch (error) {
    next(error)
  }
}

export async function previewOrganizationContactImport(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.auth) return res.status(401).json({ success: false, message: 'Unauthorized' })
    const file = assertImportFile(req.file)
    const preview = await previewContactImport(req.auth.organizationId, file.buffer)
    return success(res, preview)
  } catch (error) {
    next(error)
  }
}

export async function importOrganizationContacts(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) return res.status(401).json({ success: false, message: 'Unauthorized' })
    const file = assertImportFile(req.file)
    const duplicateAction = req.body.duplicateAction === 'update' ? 'update' : 'skip'
    const result = await importContacts(req.auth.organizationId, file.buffer, duplicateAction)
    return success(res, result, 'Contacts imported')
  } catch (error) {
    next(error)
  }
}
