import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import { Task } from '@/lib/db/models';
import { authenticateRequest } from '@/lib/auth';
import { updateTaskSchema } from '@/lib/validations';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { checkRateLimitByType } from '@/lib/utils/rateLimiter';
import { sanitizeInput, hasSQLInjection, hasNoSQLInjection, addSecurityHeaders } from '@/lib/utils/security';
import { logger } from '@/lib/utils/logger';
import { successResponse, errorResponse, handleZodError, unauthorizedResponse, notFoundResponse, HttpStatus, ErrorCode } from '@/lib/utils/apiResponse';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Validate task ID helper
function validateTaskId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

// Get a single task
export async function GET(request: NextRequest, { params }: RouteParams) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  
  try {
    const { user: authUser, error } = await authenticateRequest(request);

    if (error || !authUser) {
      logger.security('unauthorized', { ip, path: '/api/tasks/[id]', reason: 'invalid_token' });
      return unauthorizedResponse(error || 'Not authenticated');
    }

    // Rate limiting
    const rateLimitResult = checkRateLimitByType('api', ip);
    if (!rateLimitResult.allowed) {
      logger.security('rate-limit', { ip, path: '/api/tasks/[id]' });
      return errorResponse(
        `Too many requests. Please try again in ${rateLimitResult.waitTime} seconds.`,
        HttpStatus.TOO_MANY_REQUESTS,
        ErrorCode.RATE_LIMIT_ERROR
      );
    }

    const { id } = await params;

    if (!validateTaskId(id)) {
      return errorResponse('Invalid task ID', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    await connectToDatabase();

    const task = await Task.findOne({
      _id: id,
      user: authUser.userId,
    }).lean();

    if (!task) {
      return notFoundResponse('Task not found');
    }

    logger.api('GET', `/api/tasks/${id}`, HttpStatus.OK, authUser.userId);

    const response = successResponse({ task }, 'Task retrieved successfully');
    return addSecurityHeaders(response);
  } catch (error) {
    logger.error('Get task error', error);
    return errorResponse(
      'An error occurred while fetching the task',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.INTERNAL_ERROR
    );
  }
}

// Update a task
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  
  try {
    const { user: authUser, error } = await authenticateRequest(request);

    if (error || !authUser) {
      logger.security('unauthorized', { ip, path: '/api/tasks/[id]', reason: 'invalid_token' });
      return unauthorizedResponse(error || 'Not authenticated');
    }

    // Rate limiting
    const rateLimitResult = checkRateLimitByType('api', ip);
    if (!rateLimitResult.allowed) {
      logger.security('rate-limit', { ip, path: '/api/tasks/[id]' });
      return errorResponse(
        `Too many requests. Please try again in ${rateLimitResult.waitTime} seconds.`,
        HttpStatus.TOO_MANY_REQUESTS,
        ErrorCode.RATE_LIMIT_ERROR
      );
    }

    const { id } = await params;

    if (!validateTaskId(id)) {
      return errorResponse('Invalid task ID', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    await connectToDatabase();

    const body = await request.json();

    // Sanitize input
    const sanitizedBody = {
      ...body,
      title: body.title ? sanitizeInput(body.title) : undefined,
      description: body.description ? sanitizeInput(body.description) : undefined,
    };

    // Check for injection attacks
    if (
      (sanitizedBody.title && (hasSQLInjection(sanitizedBody.title) || hasNoSQLInjection(sanitizedBody.title))) ||
      (sanitizedBody.description && (hasSQLInjection(sanitizedBody.description) || hasNoSQLInjection(sanitizedBody.description)))
    ) {
      logger.security('injection-attempt', { ip, path: `/api/tasks/${id}`, type: 'update' });
      return errorResponse('Invalid input detected', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    const validatedData = updateTaskSchema.parse(sanitizedBody);

    // Process dueDate
    const updateData: Record<string, unknown> = { ...validatedData };
    if (validatedData.dueDate === null) {
      updateData.$unset = { dueDate: 1 };
      delete updateData.dueDate;
    } else if (validatedData.dueDate) {
      updateData.dueDate = new Date(validatedData.dueDate);
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, user: authUser.userId },
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!task) {
      return notFoundResponse('Task not found');
    }

    logger.api('PUT', `/api/tasks/${id}`, HttpStatus.OK, authUser.userId);

    const response = successResponse({ task }, 'Task updated successfully');
    return addSecurityHeaders(response);
  } catch (error) {
    logger.error('Update task error', error);

    if (error instanceof ZodError) {
      return handleZodError(error);
    }

    return errorResponse(
      'An error occurred while updating the task',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.INTERNAL_ERROR
    );
  }
}

// Partial update (PATCH) for status changes, etc.
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  
  try {
    const { user: authUser, error } = await authenticateRequest(request);

    if (error || !authUser) {
      logger.security('unauthorized', { ip, path: '/api/tasks/[id]', reason: 'invalid_token' });
      return unauthorizedResponse(error || 'Not authenticated');
    }

    // Rate limiting
    const rateLimitResult = checkRateLimitByType('api', ip);
    if (!rateLimitResult.allowed) {
      logger.security('rate-limit', { ip, path: '/api/tasks/[id]' });
      return errorResponse(
        `Too many requests. Please try again in ${rateLimitResult.waitTime} seconds.`,
        HttpStatus.TOO_MANY_REQUESTS,
        ErrorCode.RATE_LIMIT_ERROR
      );
    }

    const { id } = await params;

    if (!validateTaskId(id)) {
      return errorResponse('Invalid task ID', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    await connectToDatabase();

    const body = await request.json();

    // Sanitize input
    const sanitizedBody = {
      ...body,
      title: body.title ? sanitizeInput(body.title) : undefined,
      description: body.description ? sanitizeInput(body.description) : undefined,
    };

    // Check for injection attacks
    if (
      (sanitizedBody.title && (hasSQLInjection(sanitizedBody.title) || hasNoSQLInjection(sanitizedBody.title))) ||
      (sanitizedBody.description && (hasSQLInjection(sanitizedBody.description) || hasNoSQLInjection(sanitizedBody.description)))
    ) {
      logger.security('injection-attempt', { ip, path: `/api/tasks/${id}`, type: 'patch' });
      return errorResponse('Invalid input detected', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    const validatedData = updateTaskSchema.parse(sanitizedBody);

    const task = await Task.findOneAndUpdate(
      { _id: id, user: authUser.userId },
      { $set: validatedData },
      { new: true, runValidators: true }
    ).lean();

    if (!task) {
      return notFoundResponse('Task not found');
    }

    logger.api('PATCH', `/api/tasks/${id}`, HttpStatus.OK, authUser.userId);

    const response = successResponse({ task }, 'Task updated successfully');
    return addSecurityHeaders(response);
  } catch (error) {
    logger.error('Patch task error', error);

    if (error instanceof ZodError) {
      return handleZodError(error);
    }

    return errorResponse(
      'An error occurred while updating the task',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.INTERNAL_ERROR
    );
  }
}

// Delete a task
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  
  try {
    const { user: authUser, error } = await authenticateRequest(request);

    if (error || !authUser) {
      logger.security('unauthorized', { ip, path: '/api/tasks/[id]', reason: 'invalid_token' });
      return unauthorizedResponse(error || 'Not authenticated');
    }

    // Rate limiting
    const rateLimitResult = checkRateLimitByType('api', ip);
    if (!rateLimitResult.allowed) {
      logger.security('rate-limit', { ip, path: '/api/tasks/[id]' });
      return errorResponse(
        `Too many requests. Please try again in ${rateLimitResult.waitTime} seconds.`,
        HttpStatus.TOO_MANY_REQUESTS,
        ErrorCode.RATE_LIMIT_ERROR
      );
    }

    const { id } = await params;

    if (!validateTaskId(id)) {
      return errorResponse('Invalid task ID', HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    await connectToDatabase();

    const task = await Task.findOneAndDelete({
      _id: id,
      user: authUser.userId,
    });

    if (!task) {
      return notFoundResponse('Task not found');
    }

    logger.api('DELETE', `/api/tasks/${id}`, HttpStatus.OK, authUser.userId);

    const response = successResponse(null, 'Task deleted successfully');
    return addSecurityHeaders(response);
  } catch (error) {
    logger.error('Delete task error', error);
    return errorResponse(
      'An error occurred while deleting the task',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.INTERNAL_ERROR
    );
  }
}
