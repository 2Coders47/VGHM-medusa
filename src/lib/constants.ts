import { loadEnv } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

/**
 * Public URL for the backend
 */
export const BACKEND_URL = process.env.BACKEND_URL ?? 
  (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : 'http://localhost:9000')

/**
 * Database URL for Postgres instance used by the backend
 */
export const DATABASE_URL = process.env.DATABASE_URL || ''

/**
 * (optional) Redis URL for Redis instance used by the backend
 */
export const REDIS_URL = process.env.REDIS_URL

/**
 * Admin CORS origins
 */
export const ADMIN_CORS = process.env.ADMIN_CORS

/**
 * Auth CORS origins
 */
export const AUTH_CORS = process.env.AUTH_CORS

/**
 * Store/frontend CORS origins
 */
export const STORE_CORS = process.env.STORE_CORS

/**
 * JWT Secret used for signing JWT tokens
 */
export const JWT_SECRET = process.env.JWT_SECRET || 'supersecret'

/**
 * Cookie secret used for signing cookies
 */
export const COOKIE_SECRET = process.env.COOKIE_SECRET || 'supersecret'

/**
 * Host
 */
export const HOST = process.env.HOST || '0.0.0.0'

/**
 * Port
 */
export const PORT = parseInt(process.env.PORT || '9000')

