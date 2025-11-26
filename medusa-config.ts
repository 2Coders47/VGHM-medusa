import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// Auto-detect Railway's public domain or use custom BACKEND_URL
const backendUrl = process.env.BACKEND_URL || 
                   (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : 'http://localhost:9000')

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      host: process.env.HOST || "0.0.0.0",
      port: parseInt(process.env.PORT || "9000"),
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
    ...(process.env.REDIS_URL && { redisUrl: process.env.REDIS_URL }),
  },
  admin: {
    backendUrl: backendUrl,
  }
})
