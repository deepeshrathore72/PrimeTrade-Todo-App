import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import { User } from '@/lib/db/models';
import { generateToken } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';
import { ZodError } from 'zod';
import { checkRateLimit, rateLimitConfigs, rateLimitResponse } from '@/lib/utils/rateLimiter';
import { sanitizeEmail, sanitizeInput, validatePasswordStrength, addSecurityHeaders } from '@/lib/utils/security';
import { logger } from '@/lib/utils/logger';
import { successResponse, errorResponse, handleZodError, HttpStatus, ErrorCode } from '@/lib/utils/apiResponse';

export async function POST(request: NextRequest) {
  // Rate limiting
  const { allowed, resetTime } = checkRateLimit(request, rateLimitConfigs.auth);
  if (!allowed) {
    logger.security('rate-limit', { ip: request.headers.get('x-forwarded-for') || 'unknown', path: '/api/auth/register' });
    return rateLimitResponse(resetTime);
  }

  try {
    await connectToDatabase();

    const body = await request.json();
    
    // Validate input
    const validatedData = registerSchema.parse(body);

    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(validatedData.email);
    const sanitizedFirstName = sanitizeInput(validatedData.firstName);
    const sanitizedLastName = sanitizeInput(validatedData.lastName);

    // Validate password strength
    const passwordStrength = validatePasswordStrength(validatedData.password);
    if (!passwordStrength.isValid) {
      return errorResponse(
        'Password is not strong enough',
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
        passwordStrength.feedback.map(msg => ({ field: 'password', message: msg }))
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: sanitizedEmail }).select('+password');
    
    if (existingUser) {
      // Check if this is an OAuth user without a password
      // Allow them to set a password to enable email/password login
      if (existingUser.provider && existingUser.provider !== 'credentials' && !existingUser.password) {
        // OAuth user wants to set a password - update their account
        existingUser.password = validatedData.password;
        existingUser.firstName = sanitizedFirstName;
        existingUser.lastName = sanitizedLastName;
        await existingUser.save();

        logger.auth('oauth-password-set', sanitizedEmail);

        // Generate JWT token
        const token = generateToken({
          userId: existingUser._id.toString(),
          email: existingUser.email,
        });

        // Create response with cookie
        const response = successResponse(
          {
            user: {
              id: existingUser._id,
              email: existingUser.email,
              firstName: existingUser.firstName,
              lastName: existingUser.lastName,
              avatar: existingUser.avatar,
              bio: existingUser.bio,
              createdAt: existingUser.createdAt,
            },
            token,
          },
          'Password set successfully. You can now login with email and password.',
          HttpStatus.OK
        );

        response.cookies.set('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
        });

        return addSecurityHeaders(response);
      }

      // User already has a password set
      logger.auth('failed', sanitizedEmail, { reason: 'email_exists' });
      return errorResponse(
        'An account with this email already exists. Please login instead.',
        HttpStatus.CONFLICT,
        ErrorCode.CONFLICT_ERROR
      );
    }

    // Create new user
    const user = new User({
      email: sanitizedEmail,
      password: validatedData.password,
      firstName: sanitizedFirstName,
      lastName: sanitizedLastName,
      provider: 'credentials',
    });

    await user.save();

    logger.auth('register', sanitizedEmail);

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
          createdAt: user.createdAt,
        },
        token,
      },
      'Account created successfully',
      HttpStatus.CREATED
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
    logger.error('Registration error', error);

    if (error instanceof ZodError) {
      return handleZodError(error);
    }

    return errorResponse(
      'An error occurred during registration',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.INTERNAL_ERROR
    );
  }
}
