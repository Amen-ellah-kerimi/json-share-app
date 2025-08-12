import { NextResponse } from 'next/server'
import { performHealthCheck } from '@/lib/health-check'

export async function GET() {
  try {
    const healthCheck = await performHealthCheck()
    
    return NextResponse.json(healthCheck, {
      status: healthCheck.status === 'healthy' ? 200 : 503,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
