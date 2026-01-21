import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import { User } from '@/lib/db/models';
import { authenticateRequest } from '@/lib/auth';
import { updateProfileSchema, changePasswordSchema } from '@/lib/validations';
import { ZodError } from 'zod';
import { checkRateLimitByType } from '@/lib/utils/rateLimiter';
import { sanitizeInput, validatePasswordStrength, hasSQLInjection, hasNoSQLInjection, addSecurityHeaders } from '@/lib/utils/security';
import { logger } from '@/lib/utils/logger';
import { successResponse, errorResponse, handleZodError, unauthorizedResponse, notFoundResponse, HttpStatus, ErrorCode } from '@/lib/utils/apiResponse';

// Get user profile
export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  
  try {
    const { user: authUser, error } = await authenticateRequest(request);

    if (error || !authUser) {
      logger.security('unauthorized', { ip, path: '/api/user/profile', reason: 'invalid_token' });
      return unauthorizedResponse(error || 'Not authenticated');
    }

    // Rate limiting
    const rateLimitResult = checkRateLimitByType('api', ip);
    if (!rateLimitResult.allowed) {
      logger.security('rate-limit', { ip, path: '/api/user/profile' });
      return errorResponse(
        `Too many requests. Please try again in ${rateLimitResult.waitTime} seconds.`,
        HttpStatus.TOO_MANY_REQUESTS,
        ErrorCode.RATE_LIMIT_ERROR
      );
    }

    await connectToDatabase();

    const user = await User.findById(authUser.userId);

    if (!user) {
      return notFoundResponse('User not found');
    }

    logger.debug('Profile retrieved', { userId: authUser.userId });

    const response = successResponse({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        bio: user.bio,
        provider: user.provider,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    }, 'Profile retrieved successfully');

    return addSecurityHeaders(response);
  } catch (error) {
    logger.error('Get profile error', error);
    return errorResponse(
      'An error occurred while fetching profile',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.INTERNAL_ERROR
    );
  }
}

// Update user profile
export async function PUT(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  
  try {
    const { user: authUser, error } = await authenticateRequest(request);

    if (error || !authUser) {
      logger.security('unauthorized', { ip, path: '/api/user/profile', reason: 'invalid_token' });
      return unauthorizedResponse(error || 'Not authenticated');
    }

    // Rate limiting
    const rateLimitResult = checkRateLimitByType('api', ip);
    if (!rateLimitResult.allowed) {
      logger.security('rate-limit', { ip, path: '/api/user/profile' });
      return errorResponse(
        `Too many requests. Please try again in ${rateLimitResult.waitTime} seconds.`,
        HttpStatus.TOO_MANY_REQUESTS,
        ErrorCode.RATE_LIMIT_ERROR
      );
    }

    await connectToDatabase();

    const body = await request.json();

    // Sanitize input
    const sanitizedBody = {
      ...body,
      firstName: body.firstName ? sanitizeInput(body.firstName) : undefined,
      lastName: body.lastName ? sanitizeInput(body.lastName) : undefined,
      bio: body.bio ? sanitizeInput(body.bio) : undefined,
    };

    // Check for injection attacks
    const fieldsToCheck = [sanitizedBody.firstName, sanitizedBody.lastName, sanitizedBody.bio].filter(Boolean);
    for (const field of fieldsToCheck) {
      if (hasSQLInjection(field) || hasNoSQLInjection(field)) {
        logger.security('injection-attempt', { ip, path: '/api/user/profile', type: 'update' });
        return errorResponse('Invalid input detected', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }
    }

    const validatedData = updateProfileSchema.parse(sanitizedBody);

    const user = await User.findByIdAndUpdate(
      authUser.userId,
      { $set: validatedData },
      { new: true, runValidators: true }
    );

    if (!user) {
      return notFoundResponse('User not found');
    }

    logger.debug('Profile updated', { userId: authUser.userId });

    const response = successResponse({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        bio: user.bio,
        provider: user.provider,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    }, 'Profile updated successfully');

    return addSecurityHeaders(response);
  } catch (error) {
    logger.error('Update profile error', error);

    if (error instanceof ZodError) {
      return handleZodError(error);
    }

    return errorResponse(
      'An error occurred while updating profile',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.INTERNAL_ERROR
    );
  }
}

// Change password
export async function PATCH(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  
  try {
    const { user: authUser, error } = await authenticateRequest(request);

    if (error || !authUser) {
      logger.security('unauthorized', { ip, path: '/api/user/profile', reason: 'invalid_token' });
      return unauthorizedResponse(error || 'Not authenticated');
    }

    // Rate limiting - using auth config for password changes
    const rateLimitResult = checkRateLimitByType('auth', ip);
    if (!rateLimitResult.allowed) {
      logger.security('rate-limit', { ip, path: '/api/user/profile', operation: 'password_change' });
      return errorResponse(
        `Too many attempts. Please try again in ${rateLimitResult.waitTime} seconds.`,
        HttpStatus.TOO_MANY_REQUESTS,
        ErrorCode.RATE_LIMIT_ERROR
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const validatedData = changePasswordSchema.parse(body);

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(validatedData.newPassword);
    if (!passwordValidation.isValid) {
      return errorResponse(
        passwordValidation.feedback.join(', '),
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR
      );
    }

    // Get user with password
    const user = await User.findById(authUser.userId).select('+password');

    if (!user) {
      return notFoundResponse('User not found');
    }

    // Check if OAuth user without password - allow them to SET a password
    if (user.provider && user.provider !== 'credentials' && !user.password) {
      // OAuth user setting password for the first time
      user.password = validatedData.newPassword;
      await user.save();

      logger.auth('password-change', user.email, { ip, provider: user.provider });

      const response = successResponse(null, 'Password set successfully. You can now login with email and password.');
      return addSecurityHeaders(response);
    }

    // For users with existing password, verify current password
    const isPasswordValid = await user.comparePassword(validatedData.currentPassword);
    if (!isPasswordValid) {
      logger.security('password-change-failed', { ip, userId: authUser.userId, reason: 'invalid_current_password' });
      return errorResponse(
        'Current password is incorrect',
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR
      );
    }

    // Prevent using the same password
    const isSamePassword = await user.comparePassword(validatedData.newPassword);
    if (isSamePassword) {
      return errorResponse(
        'New password must be different from current password',
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR
      );
    }

    // Update password
    user.password = validatedData.newPassword;
    await user.save();

    logger.auth('password-change', user.email, { ip });

    const response = successResponse(null, 'Password changed successfully');
    return addSecurityHeaders(response);
  } catch (error) {
    logger.error('Change password error', error);

    if (error instanceof ZodError) {
      return handleZodError(error);
    }

    return errorResponse(
      'An error occurred while changing password',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.INTERNAL_ERROR
    );
  }
}
