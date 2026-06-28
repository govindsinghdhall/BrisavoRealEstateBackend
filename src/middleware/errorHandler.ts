import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../utils/errors'

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code,
    })
  }

  console.error(error)
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  })
}

export function notFoundHandler(_req: Request, res: Response): Response {
  return res.status(404).json({
    success: false,
    message: 'Route not found',
  })
}
