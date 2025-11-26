import { defineConfig } from '@medusajs/framework/utils'
import { 
  DATABASE_URL, 
  REDIS_URL, 
  HOST, 
  PORT, 
  STORE_CORS, 
  ADMIN_CORS, 
  AUTH_CORS, 
  JWT_SECRET, 
  COOKIE_SECRET,
  BACKEND_URL 
} from './src/lib/constants'

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: DATABASE_URL,
    http: {
      host: HOST,
      port: PORT,
      storeCors: STORE_CORS,
      adminCors: ADMIN_CORS,
      authCors: AUTH_CORS,
      jwtSecret: JWT_SECRET,
      cookieSecret: COOKIE_SECRET,
    },
    ...(REDIS_URL && { redisUrl: REDIS_URL }),
  },
  admin: {
    backendUrl: BACKEND_URL,
  }
})
