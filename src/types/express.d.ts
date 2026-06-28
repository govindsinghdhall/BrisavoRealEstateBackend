import type { Request } from 'express'
import type { JwtPayload } from '../utils/jwt'

export interface AuthenticatedRequest extends Request {
  auth: JwtPayload
}

declare global {
  namespace Express {
    interface Request {
      auth?: JwtPayload
    }
  }
}

export {}
