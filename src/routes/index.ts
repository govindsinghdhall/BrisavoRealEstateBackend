import { Router } from 'express'
import authRoutes from './auth.routes'
import usersRoutes from './users.routes'
import rolesRoutes from './roles.routes'
import organizationsRoutes from './organizations.routes'

const router = Router()

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'RealEstate API is running' })
})

router.use('/auth', authRoutes)
router.use('/users', usersRoutes)
router.use('/roles', rolesRoutes)
router.use('/organizations', organizationsRoutes)

export default router
