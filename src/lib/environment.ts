/**
 * Environment utilities for handling production vs development differences
 */

export const isProduction = process.env.NODE_ENV === 'production'
export const isDevelopment = process.env.NODE_ENV === 'development'
export const isTest = process.env.NODE_ENV === 'test'

// Get the current environment
export function getEnvironment(): 'production' | 'development' | 'test' {
  return process.env.NODE_ENV as 'production' | 'development' | 'test' || 'development'
}

// Check if we're running on Vercel
export const isVercel = !!process.env.VERCEL

// Get the app URL based on environment
export function getAppUrl(): string {
  // Use environment variable if available
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  
  // Vercel provides these automatically
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  // Fallback for development
  return 'http://localhost:3000'
}

// Get the database URL with proper formatting
export function getDatabaseUrl(): string {
  const dbUrl = process.env.DATABASE_URL
  
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  
  // Ensure SSL mode for production databases
  if (isProduction && dbUrl.includes('neon.tech') && !dbUrl.includes('sslmode=require')) {
    console.warn('⚠️  Adding sslmode=require to DATABASE_URL for production')
    return `${dbUrl}${dbUrl.includes('?') ? '&' : '?'}sslmode=require`
  }
  
  return dbUrl
}

// Logging configuration based on environment
export const logConfig = {
  level: isProduction ? 'error' : 'debug',
  enableConsole: !isProduction,
  enableFile: isProduction,
}

// Feature flags based on environment
export const features = {
  enableDebugMode: isDevelopment,
  enableAnalytics: isProduction,
  enableErrorReporting: isProduction,
  enablePerformanceMonitoring: isProduction,
  showDetailedErrors: isDevelopment,
}

// API configuration
export const apiConfig = {
  timeout: isProduction ? 30000 : 10000, // 30s in prod, 10s in dev
  retries: isProduction ? 3 : 1,
  baseUrl: getAppUrl(),
}

// Security headers based on environment
export const securityConfig = {
  enableCSP: isProduction,
  enableHSTS: isProduction,
  enableXFrameOptions: true,
  enableXContentTypeOptions: true,
}

// Cache configuration
export const cacheConfig = {
  enableStaticCaching: isProduction,
  enableApiCaching: isProduction,
  staticCacheDuration: isProduction ? 86400 : 0, // 24h in prod, 0 in dev
  apiCacheDuration: isProduction ? 300 : 0, // 5min in prod, 0 in dev
}

// Build information
export function getBuildInfo() {
  return {
    environment: getEnvironment(),
    isVercel,
    buildTime: process.env.BUILD_TIME || new Date().toISOString(),
    version: process.env.npm_package_version || '0.0.0',
    nodeVersion: process.version,
    nextVersion: process.env.NEXT_VERSION || 'unknown',
  }
}

// Environment validation
export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Required environment variables
  const requiredVars = [
    'DATABASE_URL',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_APP_URL',
  ]
  
  // Additional required vars for production
  if (isProduction) {
    requiredVars.push('CLERK_WEBHOOK_SIGNING_SECRET')
  }
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`)
    }
  }
  
  // Validate URL formats
  try {
    new URL(getAppUrl())
  } catch {
    errors.push('NEXT_PUBLIC_APP_URL is not a valid URL')
  }
  
  try {
    getDatabaseUrl()
  } catch (error) {
    errors.push(`Database URL validation failed: ${error}`)
  }
  
  // Validate Clerk keys format
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const secretKey = process.env.CLERK_SECRET_KEY
  
  if (publishableKey && !publishableKey.startsWith('pk_')) {
    errors.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY should start with "pk_"')
  }
  
  if (secretKey && !secretKey.startsWith('sk_')) {
    errors.push('CLERK_SECRET_KEY should start with "sk_"')
  }
  
  // Check for production vs development key mismatch
  if (isProduction) {
    if (publishableKey && !publishableKey.includes('_live_')) {
      errors.push('Production environment should use live Clerk keys (pk_live_*)')
    }
    if (secretKey && !secretKey.includes('_live_')) {
      errors.push('Production environment should use live Clerk keys (sk_live_*)')
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

// Debug helper
export function debugEnvironment() {
  if (!isDevelopment) return
  
  console.log('🔧 Environment Debug Info:')
  console.log('  Environment:', getEnvironment())
  console.log('  App URL:', getAppUrl())
  console.log('  Is Vercel:', isVercel)
  console.log('  Build Info:', getBuildInfo())
  
  const validation = validateEnvironment()
  if (!validation.valid) {
    console.warn('⚠️  Environment validation errors:')
    validation.errors.forEach(error => console.warn(`  - ${error}`))
  } else {
    console.log('✅ Environment validation passed')
  }
}
