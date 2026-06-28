import type { NextFunction, Request, Response } from 'express'
import { ZodError, type ZodSchema } from 'zod'
import { AppError } from '../utils/errors'

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors.map((item) => item.message).join(', ')
        next(new AppError(message, 400, 'VALIDATION_ERROR'))
        return
      }
      next(error)
    }
  }
}
