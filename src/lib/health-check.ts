import { db, checkDatabaseConnection } from './db'
import { checkEnvVars } from './env'
import { logger } from './logger'

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy'
  checks: {
    database: boolean
    environment: boolean
    prisma: boolean
  }
  timestamp: string
  version?: string
}

export async function performHealthCheck(): Promise<HealthCheckResult> {
  const timestamp = new Date().toISOString()
  
  logger.info('Starting health check')
  
  // Check environment variables
  const envCheck = checkEnvVars()
  
  // Check database connection
  const dbCheck = await checkDatabaseConnection()
  
  // Check Prisma client
  let prismaCheck = false
  try {
    await db.$queryRaw`SELECT 1`
    prismaCheck = true
  } catch (error) {
    logger.error('Prisma health check failed', error)
  }
  
  const allChecksPass = envCheck && dbCheck && prismaCheck
  
  const result: HealthCheckResult = {
    status: allChecksPass ? 'healthy' : 'unhealthy',
    checks: {
      database: dbCheck,
      environment: envCheck,
      prisma: prismaCheck,
    },
    timestamp,
    version: process.env.npm_package_version || 'unknown',
  }
  
  logger.info('Health check completed', { 
    status: result.status, 
    checks: result.checks 
  })
  
  return result
}

// Startup health check
export async function startupHealthCheck() {
  console.log('🔍 Running startup health check...')
  
  const result = await performHealthCheck()
  
  if (result.status === 'healthy') {
    console.log('✅ All systems healthy - ready to serve requests')
  } else {
    console.error('❌ Health check failed:')
    Object.entries(result.checks).forEach(([check, passed]) => {
      console.log(`  ${passed ? '✅' : '❌'} ${check}`)
    })
    
    if (process.env.NODE_ENV === 'production') {
      console.error('Exiting due to failed health check in production')
      process.exit(1)
    }
  }
  
  return result
}
