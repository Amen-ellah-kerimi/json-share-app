import { db, checkDatabaseConnection } from './db'
import { checkEnvVars } from './env'
import { logger } from './logger'

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy'
  checks: {
    database: boolean
    environment: boolean
    prisma: boolean
    clerk: boolean
  }
  timestamp: string
  version?: string
  environment: string
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

  // Check Clerk configuration
  let clerkCheck = false
  try {
    const requiredClerkVars = [
      'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      'CLERK_SECRET_KEY'
    ]
    clerkCheck = requiredClerkVars.every(varName => process.env[varName])

    if (process.env.NODE_ENV === 'production') {
      // In production, also check webhook secret
      clerkCheck = clerkCheck && !!process.env.CLERK_WEBHOOK_SIGNING_SECRET
    }
  } catch (error) {
    logger.error('Clerk configuration check failed', error)
  }

  const allChecksPass = envCheck && dbCheck && prismaCheck && clerkCheck
  
  const result: HealthCheckResult = {
    status: allChecksPass ? 'healthy' : 'unhealthy',
    checks: {
      database: dbCheck,
      environment: envCheck,
      prisma: prismaCheck,
      clerk: clerkCheck,
    },
    timestamp,
    version: process.env.npm_package_version || 'unknown',
    environment: process.env.NODE_ENV || 'unknown',
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
