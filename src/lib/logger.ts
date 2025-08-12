type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogContext {
  userId?: string
  documentId?: string
  action?: string
  ip?: string
  userAgent?: string
  [key: string]: unknown
}

class Logger {
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : ''
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`
  }

  info(message: string, context?: LogContext) {
    console.log(this.formatMessage('info', message, context))
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage('warn', message, context))
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorDetails = error instanceof Error 
      ? { name: error.name, message: error.message, stack: error.stack }
      : { error: String(error) }
    
    const fullContext = { ...context, error: errorDetails }
    console.error(this.formatMessage('error', message, fullContext))
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('debug', message, context))
    }
  }

  // Specific logging methods for common scenarios
  apiRequest(method: string, path: string, userId?: string, ip?: string) {
    this.info(`API Request: ${method} ${path}`, { userId, ip, action: 'api_request' })
  }

  apiError(method: string, path: string, error: Error, userId?: string) {
    this.error(`API Error: ${method} ${path}`, error, { userId, action: 'api_error' })
  }

  userAction(action: string, userId: string, details?: Record<string, unknown>) {
    this.info(`User Action: ${action}`, { userId, action, ...details })
  }

  databaseError(operation: string, error: Error, context?: LogContext) {
    this.error(`Database Error: ${operation}`, error, { ...context, action: 'database_error' })
  }

  webhookEvent(eventType: string, success: boolean, details?: Record<string, unknown>) {
    const message = `Webhook ${eventType}: ${success ? 'Success' : 'Failed'}`

    if (success) {
      this.info(message, { action: 'webhook', eventType, ...details })
    } else {
      this.error(message, undefined, { action: 'webhook', eventType, ...details })
    }
  }
}

export const logger = new Logger()

// Error boundary helper for API routes
export function withErrorLogging<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  context: { operation: string; userId?: string }
) {
  return async (...args: T): Promise<R> => {
    try {
      logger.debug(`Starting operation: ${context.operation}`, context)
      const result = await fn(...args)
      logger.debug(`Completed operation: ${context.operation}`, context)
      return result
    } catch (error) {
      logger.error(`Operation failed: ${context.operation}`, error, context)
      throw error
    }
  }
}
