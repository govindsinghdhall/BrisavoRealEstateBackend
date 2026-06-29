import { Router } from 'express'
import {
  createPublicInquiry,
  getPublicSiteProperty,
  getPublicSiteStats,
  listPublicSiteBuilders,
  listPublicSiteProperties,
} from '../controllers/public.controller'

const router = Router()

router.get('/properties', listPublicSiteProperties)
router.get('/properties/:id', getPublicSiteProperty)
router.get('/builders', listPublicSiteBuilders)
router.get('/stats', getPublicSiteStats)
router.post('/inquiries', createPublicInquiry)

export default router
