import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import { User } from '@/lib/db/models';
import { generateToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { ZodError } from 'zod';
import { checkLoginRateLimit, resetLoginAttempts } from '@/lib/utils/rateLimiter';
import { sanitizeEmail, addSecurityHeaders } from '@/lib/utils/security';
import { logger } from '@/lib/utils/logger';
import { successResponse, errorResponse, handleZodError, HttpStatus, ErrorCode } from '@/lib/utils/apiResponse';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  
  try {
    await connectToDatabase();

    const body = await request.json();
    
    // Validate input
    const validatedData = loginSchema.parse(body);
    const sanitizedEmail = sanitizeEmail(validatedData.email);

    // Check rate limit for this IP + email combination
    const { allowed, waitTime } = checkLoginRateLimit(ip, sanitizedEmail);
    if (!allowed) {
      logger.security('rate-limit', { ip, path: '/api/auth/login', reason: 'login_attempts_exceeded' });
      return errorResponse(
        `Too many login attempts. Please try again in ${waitTime} seconds.`,
        HttpStatus.TOO_MANY_REQUESTS,
        ErrorCode.RATE_LIMIT_ERROR
      );
    }

    // Find user with password
    const user = await User.findOne({ email: sanitizedEmail }).select('+password');

    if (!user) {
      logger.auth('failed', sanitizedEmail, { ip, reason: 'user_not_found' });
      return errorResponse(
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
        ErrorCode.AUTHENTICATION_ERROR
      );
    }

    // Check if this is an OAuth user without a password set
    if (!user.password && user.provider && user.provider !== 'credentials') {
      logger.auth('failed', sanitizedEmail, { ip, reason: 'oauth_no_password' });
      return errorResponse(
        `This account was created with ${user.provider === 'google' ? 'Google' : 'GitHub'}. Please sign in using ${user.provider === 'google' ? 'Google' : 'GitHub'}, or register with this email to set a password.`,
        HttpStatus.UNAUTHORIZED,
        ErrorCode.AUTHENTICATION_ERROR
      );
    }

    // Check if account is locked
    if (user.isLocked()) {
      logger.auth('failed', sanitizedEmail, { ip, reason: 'account_locked' });
      return errorResponse(
        'Your account has been temporarily locked due to too many failed attempts. Please try again later.',
        HttpStatus.UNAUTHORIZED,
        ErrorCode.AUTHENTICATION_ERROR
      );
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(validatedData.password);
    if (!isPasswordValid) {
      // Increment failed login attempts
      await user.incrementLoginAttempts();
      logger.auth('failed', sanitizedEmail, { ip, reason: 'invalid_password' });
      return errorResponse(
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
        ErrorCode.AUTHENTICATION_ERROR
      );
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();
    resetLoginAttempts(ip, sanitizedEmail);
    
    logger.auth('login', sanitizedEmail, { ip });

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // Create response with cookie
    const response = successResponse(
      {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          bio: user.bio,
          provider: user.provider,
          createdAt: user.createdAt,
        },
        token,
      },
      'Login successful',
      HttpStatus.OK
    );

    // Set HTTP-only cookie with enhanced security
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return addSecurityHeaders(response);
  } catch (error) {
    logger.error('Login error', error);

    if (error instanceof ZodError) {
      return handleZodError(error);
    }

    return errorResponse(
      'An error occurred during login',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.INTERNAL_ERROR
    );
  }
}
