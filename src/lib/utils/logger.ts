import { maskSensitiveData } from './security';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  requestId?: string;
  userId?: string;
  ip?: string;
  path?: string;
  method?: string;
  duration?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

/**
 * Format log entry for output
 */
function formatLogEntry(entry: LogEntry): string {
  const base = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`;
  
  if (process.env.NODE_ENV === 'development') {
    // Pretty print in development
    const context = entry.context ? ` | Context: ${JSON.stringify(maskSensitiveData(entry.context), null, 2)}` : '';
    const error = entry.error ? ` | Error: ${entry.error.name}: ${entry.error.message}` : '';
    return `${base}${context}${error}`;
  }
  
  // JSON format for production (better for log aggregation)
  return JSON.stringify(maskSensitiveData(entry));
}

/**
 * Create a log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: Record<string, any>
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context && { context }),
  };
}

/**
 * Should log based on current log level
 */
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLogLevel];
}

/**
 * Logger object with methods for each log level
 */
export const logger = {
  debug(message: string, context?: Record<string, any>) {
    if (shouldLog('debug')) {
      console.debug(formatLogEntry(createLogEntry('debug', message, context)));
    }
  },

  info(message: string, context?: Record<string, any>) {
    if (shouldLog('info')) {
      console.info(formatLogEntry(createLogEntry('info', message, context)));
    }
  },

  warn(message: string, context?: Record<string, any>) {
    if (shouldLog('warn')) {
      console.warn(formatLogEntry(createLogEntry('warn', message, context)));
    }
  },

  error(message: string, error?: Error | unknown, context?: Record<string, any>) {
    if (shouldLog('error')) {
      const entry = createLogEntry('error', message, context);
      if (error instanceof Error) {
        entry.error = {
          name: error.name,
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        };
      }
      console.error(formatLogEntry(entry));
    }
  },

  /**
   * Log API request
   */
  request(
    method: string,
    path: string,
    context?: {
      userId?: string;
      ip?: string;
      userAgent?: string;
      body?: Record<string, any>;
    }
  ) {
    this.info(`${method} ${path}`, {
      type: 'request',
      method,
      path,
      ...context,
    });
  },

  /**
   * Log API response
   */
  response(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    context?: {
      userId?: string;
      ip?: string;
    }
  ) {
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    this[level](`${method} ${path} - ${statusCode} (${duration}ms)`, {
      type: 'response',
      method,
      path,
      statusCode,
      duration,
      ...context,
    });
  },

  /**
   * Log authentication event
   */
  auth(
    event: 'login' | 'logout' | 'register' | 'oauth' | 'failed' | 'password-change' | 'password-reset',
    email: string,
    context?: {
      ip?: string;
      provider?: string;
      reason?: string;
    }
  ) {
    const message = `Auth ${event}: ${email}`;
    if (event === 'failed') {
      this.warn(message, { type: 'auth', event, email, ...context });
    } else {
      this.info(message, { type: 'auth', event, email, ...context });
    }
  },

  /**
   * Log API operation for tracking
   */
  api(
    method: string,
    path: string,
    statusCode: number,
    userId?: string,
    context?: Record<string, any>
  ) {
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'debug';
    this[level](`API ${method} ${path} - ${statusCode}`, {
      type: 'api',
      method,
      path,
      statusCode,
      userId,
      ...context,
    });
  },

  /**
   * Log database operation
   */
  db(
    operation: 'query' | 'insert' | 'update' | 'delete',
    collection: string,
    duration?: number,
    context?: Record<string, any>
  ) {
    this.debug(`DB ${operation} on ${collection}${duration ? ` (${duration}ms)` : ''}`, {
      type: 'database',
      operation,
      collection,
      duration,
      ...context,
    });
  },

  /**
   * Log security event
   */
  security(
    event: 'rate-limit' | 'blocked-ip' | 'suspicious-activity' | 'injection-attempt' | 'unauthorized' | 'password-change-failed',
    context: {
      ip?: string;
      path?: string;
      reason?: string;
      userId?: string;
      type?: string;
      operation?: string;
    }
  ) {
    this.warn(`Security: ${event}`, {
      type: 'security',
      event,
      ...context,
    });
  },

  /**
   * Create a child logger with context
   */
  child(defaultContext: Record<string, any>) {
    return {
      debug: (message: string, context?: Record<string, any>) =>
        logger.debug(message, { ...defaultContext, ...context }),
      info: (message: string, context?: Record<string, any>) =>
        logger.info(message, { ...defaultContext, ...context }),
      warn: (message: string, context?: Record<string, any>) =>
        logger.warn(message, { ...defaultContext, ...context }),
      error: (message: string, error?: Error | unknown, context?: Record<string, any>) =>
        logger.error(message, error, { ...defaultContext, ...context }),
    };
  },
};

export default logger;
