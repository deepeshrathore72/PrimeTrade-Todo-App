import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  Array.from(rateLimitStore.entries()).forEach(([key, entry]) => {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  });
}, 60000); // Clean every minute

/**
 * Get rate limit key from request
 */
function getRateLimitKey(request: NextRequest, prefix: string = ''): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  const path = request.nextUrl.pathname;
  return `${prefix}:${ip}:${path}`;
}

/**
 * Check and update rate limit
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig = { windowMs: 60000, maxRequests: 100 }
): { allowed: boolean; remaining: number; resetTime: number } {
  const key = getRateLimitKey(request);
  const now = Date.now();

  let entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: entry.resetTime,
    };
  }

  entry.count += 1;
  rateLimitStore.set(key, entry);

  const allowed = entry.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);

  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
  };
}

/**
 * Rate limit middleware response
 */
export function rateLimitResponse(resetTime: number): NextResponse {
  const response = NextResponse.json(
    {
      success: false,
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
    },
    { status: 429 }
  );

  response.headers.set(
    'Retry-After',
    Math.ceil((resetTime - Date.now()) / 1000).toString()
  );

  return response;
}

/**
 * Rate limit configurations for different endpoints
 */
export const rateLimitConfigs = {
  // Strict rate limiting for auth endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // 10 requests per 15 minutes
  },
  // Normal rate limiting for API endpoints
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  },
  // Lenient rate limiting for read operations
  read: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 200, // 200 requests per minute
  },
  // Very strict for password reset
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 requests per hour
  },
};

/**
 * Create rate limit middleware for API routes
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: RateLimitConfig = rateLimitConfigs.api
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const { allowed, remaining, resetTime } = checkRateLimit(request, config);

    if (!allowed) {
      return rateLimitResponse(resetTime);
    }

    const response = await handler(request);

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', resetTime.toString());

    return response;
  };
}

/**
 * Check rate limit by type and IP (for inline usage in API routes)
 */
export function checkRateLimitByType(
  type: keyof typeof rateLimitConfigs,
  ip: string
): { allowed: boolean; remaining: number; resetTime: number; waitTime: number } {
  const config = rateLimitConfigs[type];
  const key = `${type}:${ip}`;
  const now = Date.now();

  let entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: entry.resetTime,
      waitTime: 0,
    };
  }

  entry.count += 1;
  rateLimitStore.set(key, entry);

  const allowed = entry.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);
  const waitTime = allowed ? 0 : Math.ceil((entry.resetTime - now) / 1000);

  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
    waitTime,
  };
}

/**
 * Login-specific rate limiter with exponential backoff
 */
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function checkLoginRateLimit(
  ip: string,
  email: string
): { allowed: boolean; waitTime: number } {
  const key = `login:${ip}:${email}`;
  const now = Date.now();
  const attempt = loginAttempts.get(key);

  if (!attempt) {
    loginAttempts.set(key, { count: 1, lastAttempt: now });
    return { allowed: true, waitTime: 0 };
  }

  // Exponential backoff: 2^(attempts-1) seconds, max 30 minutes
  const waitTime = Math.min(
    Math.pow(2, attempt.count - 1) * 1000,
    30 * 60 * 1000
  );

  const timeSinceLastAttempt = now - attempt.lastAttempt;

  if (timeSinceLastAttempt >= waitTime) {
    // Reset if enough time has passed
    if (timeSinceLastAttempt >= 30 * 60 * 1000) {
      loginAttempts.set(key, { count: 1, lastAttempt: now });
    } else {
      loginAttempts.set(key, { count: attempt.count + 1, lastAttempt: now });
    }
    return { allowed: true, waitTime: 0 };
  }

  return {
    allowed: false,
    waitTime: Math.ceil((waitTime - timeSinceLastAttempt) / 1000),
  };
}

export function resetLoginAttempts(ip: string, email: string): void {
  const key = `login:${ip}:${email}`;
  loginAttempts.delete(key);
}
