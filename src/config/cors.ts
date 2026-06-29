import type { CorsOptions } from 'cors'
import { corsOrigins, env } from './env'

const LOCALHOST_ORIGIN = /^https?:\/\/localhost(:\d+)?$/
const LOCAL_NETWORK_ORIGIN = /^https?:\/\/127\.0\.0\.1(:\d+)?$/
const RENDER_ORIGIN = /^https:\/\/[a-z0-9-]+\.onrender\.com$/

function isAllowedOrigin(origin: string): boolean {
  if (corsOrigins.includes(origin)) {
    return true
  }

  // Local dev against a remote API (e.g. Render) uses localhost or 127.0.0.1.
  if (LOCALHOST_ORIGIN.test(origin) || LOCAL_NETWORK_ORIGIN.test(origin)) {
    return true
  }

  if (env.NODE_ENV === 'production' && RENDER_ORIGIN.test(origin)) {
    return true
  }

  return false
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
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  }
}

export function logCorsConfig(): void {
  console.log(`CORS origins: ${corsOrigins.join(', ')}`)
  console.log('CORS also allows: http://localhost:*, http://127.0.0.1:*')
  if (env.NODE_ENV === 'production') {
    console.log('CORS also allows: https://*.onrender.com')
  }
}
