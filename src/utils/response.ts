import type { Response } from 'express'

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export function success<T>(res: Response, data: T, message?: string, status = 200) {
  return res.status(status).json({
    success: true,
    message,
    data,
  })
}

export function successPaginated<T>(
  res: Response,
  data: T[],
  meta: PaginationMeta,
  message?: string,
) {
  return res.status(200).json({
    success: true,
    message,
    data,
    meta,
  })
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}
