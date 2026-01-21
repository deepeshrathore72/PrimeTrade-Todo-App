import CryptoJS from 'crypto-js';
import sanitizeHtml from 'sanitize-html';
import { NextRequest, NextResponse } from 'next/server';

// Environment-based encryption key
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'default-key';

/**
 * Encrypt sensitive data
 */
export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

/**
 * Decrypt sensitive data
 */
export function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const array = CryptoJS.lib.WordArray.random(length);
  return array.toString(CryptoJS.enc.Hex);
}

/**
 * Hash sensitive data (one-way)
 */
export function hashData(data: string): string {
  return CryptoJS.SHA256(data).toString();
}

/**
 * Sanitize HTML input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
  });
}

/**
 * Sanitize object values recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'string' ? sanitizeInput(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim().replace(/[<>'"]/g, '');
}

/**
 * Check for SQL injection patterns
 */
export function hasSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\s|^)(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)(\s|$)/i,
    /--/,
    /;.*--/,
    /\/\*.*\*\//,
    /xp_/i,
    /EXEC(\s|@)/i,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Check for NoSQL injection patterns
 */
export function hasNoSQLInjection(input: string): boolean {
  const nosqlPatterns = [
    /\$where/i,
    /\$gt/i,
    /\$lt/i,
    /\$ne/i,
    /\$regex/i,
    /\$or/i,
    /\$and/i,
  ];

  return nosqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Validate input against injection attacks
 */
export function isSecureInput(input: string): boolean {
  return !hasSQLInjection(input) && !hasNoSQLInjection(input);
}

/**
 * Security headers for API responses
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  );
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  return response;
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: any, fieldsToMask: string[] = ['password', 'token', 'secret', 'key', 'authorization']): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const masked = { ...data };

  for (const key of Object.keys(masked)) {
    if (fieldsToMask.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
      masked[key] = '***MASKED***';
    } else if (typeof masked[key] === 'object') {
      masked[key] = maskSensitiveData(masked[key], fieldsToMask);
    }
  }

  return masked;
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push('Password should be at least 8 characters');

  if (password.length >= 12) score += 1;

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Add uppercase letters');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Add numbers');

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else feedback.push('Add special characters');

  // Check for common patterns
  const commonPatterns = [
    /^123/,
    /password/i,
    /qwerty/i,
    /abc123/i,
    /(.)\1{2,}/,
  ];

  if (commonPatterns.some((pattern) => pattern.test(password))) {
    score = Math.max(0, score - 2);
    feedback.push('Avoid common patterns');
  }

  return {
    isValid: score >= 4,
    score,
    feedback,
  };
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return generateSecureToken(32);
}

/**
 * Validate origin for CORS
 */
export function isValidOrigin(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) return false;
  return allowedOrigins.some((allowed) => {
    if (allowed === '*') return true;
    if (allowed.startsWith('*.')) {
      const domain = allowed.slice(2);
      return origin.endsWith(domain);
    }
    return origin === allowed;
  });
}

/**
 * Rate limit key generator
 */
export function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return `rate-limit:${ip}`;
}

/**
 * Escape special regex characters
 */
export function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
