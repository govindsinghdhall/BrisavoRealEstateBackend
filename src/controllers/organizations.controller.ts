import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { PERMISSIONS } from '../constants/permissions'
import {
  getOrganizationById,
  serializeOrganization,
} from '../services/organization.service'
import { success } from '../utils/response'

const updateOrganizationSchema = z.object({
  name: z.string().min(1).optional(),
  logo: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  settings: z
    .object({
      faviconUrl: z.string().optional(),
      tagline: z.string().optional(),
    })
    .nullable()
    .optional(),
})

export async function getCurrentOrganization(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const organization = await getOrganizationById(req.auth.organizationId)
    return success(res, serializeOrganization(organization))
  } catch (error) {
    next(error)
  }
}

export async function updateCurrentOrganization(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const payload = updateOrganizationSchema.parse(req.body)
    const organization = await getOrganizationById(req.auth.organizationId)

    if (payload.name !== undefined) organization.name = payload.name
    if (payload.logo !== undefined) organization.logo = payload.logo
    if (payload.email !== undefined) organization.email = payload.email
    if (payload.phone !== undefined) organization.phone = payload.phone
    if (payload.address !== undefined) organization.address = payload.address
    if (payload.settings !== undefined) organization.settings = payload.settings

    await organization.save()
    return success(res, serializeOrganization(organization), 'Organization updated')
  } catch (error) {
    next(error)
  }
}

export async function uploadLogo(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    // Placeholder until file storage is wired up
    const organization = await getOrganizationById(req.auth.organizationId)
    return success(res, serializeOrganization(organization), 'Logo upload not configured yet')
  } catch (error) {
    next(error)
  }
}

export async function uploadFavicon(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const organization = await getOrganizationById(req.auth.organizationId)
    return success(res, serializeOrganization(organization), 'Favicon upload not configured yet')
  } catch (error) {
    next(error)
  }
}

export const organizationPermissions = {
  read: [PERMISSIONS.ORGANIZATION_READ],
  update: [PERMISSIONS.ORGANIZATION_UPDATE],
}
