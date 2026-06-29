import type { CorsOptions } from 'cors'
import { corsOrigins, env } from './env'

const LOCALHOST_ORIGIN = /^https?:\/\/localhost(:\d+)?$/
const LOCAL_NETWORK_ORIGIN = /^https?:\/\/127\.0\.0\.1(:\d+)?$/
const RENDER_ORIGIN = /^https:\/\/[a-z0-9-]+\.onrender\.com$/

function isAllowedOrigin(origin: string): boolean {
  if (corsOrigins.includes(origin)) {
    return true
  }

  if (env.NODE_ENV !== 'production') {
    return LOCALHOST_ORIGIN.test(origin) || LOCAL_NETWORK_ORIGIN.test(origin)
  }

  return RENDER_ORIGIN.test(origin)
}

export function getCorsOptions(): CorsOptions {
  return {
    origin(origin, callback) {
      // Postman, curl, and same-origin server requests send no Origin header.
      if (!origin) {
        callback(null, true)
        return
      }

      if (isAllowedOrigin(origin)) {
        callback(null, true)
        return
      }

      console.warn(`CORS blocked origin: ${origin}`)
      console.warn(`Allowed origins: ${corsOrigins.join(', ')}`)
      callback(null, false)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }
}

export function logCorsConfig(): void {
  console.log(`CORS origins: ${corsOrigins.join(', ')}`)
  if (env.NODE_ENV === 'production') {
    console.log('CORS also allows: https://*.onrender.com')
  }
}
