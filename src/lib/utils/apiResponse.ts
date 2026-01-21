import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { addSecurityHeaders, maskSensitiveData } from './security';

// Response types
interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

interface ErrorResponse {
  success: false;
  error: string;
  errors?: Array<{ field: string; message: string }>;
  code?: string;
  statusCode: number;
}

// HTTP Status codes
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Error codes
export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

/**
 * Create a successful API response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = HttpStatus.OK,
  meta?: SuccessResponse<T>['meta']
): NextResponse<SuccessResponse<T>> {
  const response = NextResponse.json<SuccessResponse<T>>(
    {
      success: true,
      data,
      ...(message && { message }),
      ...(meta && { meta }),
    },
    { status }
  );

  return addSecurityHeaders(response) as NextResponse<SuccessResponse<T>>;
}

/**
 * Create an error API response
 */
export function errorResponse(
  error: string,
  status: number = HttpStatus.BAD_REQUEST,
  code?: string,
  errors?: Array<{ field: string; message: string }>
): NextResponse<ErrorResponse> {
  const response = NextResponse.json<ErrorResponse>(
    {
      success: false,
      error,
      statusCode: status,
      ...(code && { code }),
      ...(errors && { errors }),
    },
    { status }
  );

  return addSecurityHeaders(response) as NextResponse<ErrorResponse>;
}

/**
 * Handle Zod validation errors
 */
export function handleZodError(error: ZodError): NextResponse<ErrorResponse> {
  const errors = error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return errorResponse(
    'Validation failed',
    HttpStatus.BAD_REQUEST,
    ErrorCode.VALIDATION_ERROR,
    errors
  );
}

/**
 * Handle database errors
 */
export function handleDatabaseError(error: any): NextResponse<ErrorResponse> {
  // MongoDB duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || 'field';
    return errorResponse(
      `A record with this ${field} already exists`,
      HttpStatus.CONFLICT,
      ErrorCode.CONFLICT_ERROR,
      [{ field, message: `This ${field} is already taken` }]
    );
  }

  // MongoDB validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors || {}).map((err: any) => ({
      field: err.path,
      message: err.message,
    }));
    return errorResponse(
      'Validation failed',
      HttpStatus.BAD_REQUEST,
      ErrorCode.VALIDATION_ERROR,
      errors
    );
  }

  // Generic database error
  console.error('Database error:', maskSensitiveData(error));
  return errorResponse(
    'Database operation failed',
    HttpStatus.INTERNAL_SERVER_ERROR,
    ErrorCode.DATABASE_ERROR
  );
}

/**
 * Handle unknown errors
 */
export function handleUnknownError(error: unknown): NextResponse<ErrorResponse> {
  console.error('Unhandled error:', error);

  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message =
      process.env.NODE_ENV === 'development'
        ? error.message
        : 'An unexpected error occurred';

    return errorResponse(
      message,
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.INTERNAL_ERROR
    );
  }

  return errorResponse(
    'An unexpected error occurred',
    HttpStatus.INTERNAL_SERVER_ERROR,
    ErrorCode.INTERNAL_ERROR
  );
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(
  message: string = 'Authentication required'
): NextResponse<ErrorResponse> {
  return errorResponse(
    message,
    HttpStatus.UNAUTHORIZED,
    ErrorCode.AUTHENTICATION_ERROR
  );
}

/**
 * Create forbidden response
 */
export function forbiddenResponse(
  message: string = 'Access denied'
): NextResponse<ErrorResponse> {
  return errorResponse(
    message,
    HttpStatus.FORBIDDEN,
    ErrorCode.AUTHORIZATION_ERROR
  );
}

/**
 * Create not found response
 */
export function notFoundResponse(
  resource: string = 'Resource'
): NextResponse<ErrorResponse> {
  return errorResponse(
    `${resource} not found`,
    HttpStatus.NOT_FOUND,
    ErrorCode.NOT_FOUND_ERROR
  );
}

/**
 * Create rate limit exceeded response
 */
export function rateLimitExceededResponse(
  retryAfter: number
): NextResponse<ErrorResponse> {
  const response = errorResponse(
    'Too many requests. Please try again later.',
    HttpStatus.TOO_MANY_REQUESTS,
    ErrorCode.RATE_LIMIT_ERROR
  );

  response.headers.set('Retry-After', retryAfter.toString());

  return response;
}

/**
 * Wrapper for API handlers with error handling
 */
export function withErrorHandler<T>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | ErrorResponse>> {
  return handler().catch((error) => {
    if (error instanceof ZodError) {
      return handleZodError(error);
    }
    if (error.name === 'MongoError' || error.name === 'ValidationError') {
      return handleDatabaseError(error);
    }
    return handleUnknownError(error);
  });
}
