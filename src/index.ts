import { createApp } from './app'
import { connectDatabase } from './config/database'
import { logCorsConfig } from './config/cors'
import { env } from './config/env'
import { seedDemoOrganization } from './scripts/seed'

async function bootstrap() {
  logCorsConfig()
  await connectDatabase()
  await seedDemoOrganization()

  const app = createApp()
  app.listen(env.PORT, () => {
    console.log(`RealEstate API listening on http://localhost:${env.PORT}`)
    console.log(`Health check: http://localhost:${env.PORT}/api/v1/health`)
  })
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
