import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import { Task } from '@/lib/db/models';
import { authenticateRequest } from '@/lib/auth';
import { createTaskSchema, taskQuerySchema } from '@/lib/validations';
import { ZodError } from 'zod';
import { checkRateLimitByType } from '@/lib/utils/rateLimiter';
import { sanitizeInput, hasSQLInjection, hasNoSQLInjection, addSecurityHeaders } from '@/lib/utils/security';
import { logger } from '@/lib/utils/logger';
import { successResponse, errorResponse, handleZodError, unauthorizedResponse, HttpStatus, ErrorCode } from '@/lib/utils/apiResponse';
import mongoose from 'mongoose';

// Get all tasks with filtering, sorting, and pagination
export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  
  try {
    const { user: authUser, error } = await authenticateRequest(request);

    if (error || !authUser) {
      logger.security('unauthorized', { ip, path: '/api/tasks', reason: 'invalid_token' });
      return unauthorizedResponse(error || 'Not authenticated');
    }

    // Rate limiting
    const rateLimitResult = checkRateLimitByType('api', ip);
    if (!rateLimitResult.allowed) {
      logger.security('rate-limit', { ip, path: '/api/tasks' });
      return errorResponse(
        `Too many requests. Please try again in ${rateLimitResult.waitTime} seconds.`,
        HttpStatus.TOO_MANY_REQUESTS,
        ErrorCode.RATE_LIMIT_ERROR
      );
    }

    await connectToDatabase();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      status: searchParams.get('status') || undefined,
      priority: searchParams.get('priority') || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    const validatedQuery = taskQuerySchema.parse(queryParams);

    // Check for injection attacks in search query
    if (validatedQuery.search) {
      if (hasSQLInjection(validatedQuery.search) || hasNoSQLInjection(validatedQuery.search)) {
        logger.security('injection-attempt', { ip, path: '/api/tasks', type: 'search' });
        return errorResponse(
          'Invalid search query',
          HttpStatus.BAD_REQUEST,
          ErrorCode.VALIDATION_ERROR
        );
      }
      validatedQuery.search = sanitizeInput(validatedQuery.search);
    }

    // Build filter with proper ObjectId conversion
    const filter: Record<string, unknown> = { user: new mongoose.Types.ObjectId(authUser.userId) };

    if (validatedQuery.status) {
      filter.status = validatedQuery.status;
    }

    if (validatedQuery.priority) {
      filter.priority = validatedQuery.priority;
    }

    if (validatedQuery.search) {
      filter.$or = [
        { title: { $regex: validatedQuery.search, $options: 'i' } },
        { description: { $regex: validatedQuery.search, $options: 'i' } },
      ];
    }

    // Build sort with type safety
    const sort: Record<string, 1 | -1> = {};
    sort[validatedQuery.sortBy] = validatedQuery.sortOrder === 'asc' ? 1 : -1;

    // Pagination with limits
    const maxLimit = 100;
    const actualLimit = Math.min(validatedQuery.limit, maxLimit);
    const skip = (validatedQuery.page - 1) * actualLimit;

    // Execute queries
    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(actualLimit)
        .lean(),
      Task.countDocuments(filter),
    ]);

    // Get task statistics
    const stats = await Task.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(authUser.userId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          todo: {
            $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] },
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
        },
      },
    ]);

    const taskStats = stats[0] || { total: 0, todo: 0, inProgress: 0, completed: 0 };
    
    logger.api('GET', '/api/tasks', HttpStatus.OK, authUser.userId);

    const response = successResponse(
      {
        tasks,
        pagination: {
          page: validatedQuery.page,
          limit: actualLimit,
          total,
          totalPages: Math.ceil(total / actualLimit),
        },
        stats: taskStats,
      },
      'Tasks retrieved successfully'
    );

    return addSecurityHeaders(response);
  } catch (error) {
    logger.error('Get tasks error', error);

    if (error instanceof ZodError) {
      return handleZodError(error);
    }

    return errorResponse(
      'An error occurred while fetching tasks',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.INTERNAL_ERROR
    );
  }
}

// Create a new task
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  
  try {
    const { user: authUser, error } = await authenticateRequest(request);

    if (error || !authUser) {
      logger.security('unauthorized', { ip, path: '/api/tasks', reason: 'invalid_token' });
      return unauthorizedResponse(error || 'Not authenticated');
    }

    // Rate limiting
    const rateLimitResult = checkRateLimitByType('api', ip);
    if (!rateLimitResult.allowed) {
      logger.security('rate-limit', { ip, path: '/api/tasks' });
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
      title: body.title ? sanitizeInput(body.title) : undefined,
      description: body.description ? sanitizeInput(body.description) : undefined,
    };

    // Check for injection attacks
    if (
      (sanitizedBody.title && (hasSQLInjection(sanitizedBody.title) || hasNoSQLInjection(sanitizedBody.title))) ||
      (sanitizedBody.description && (hasSQLInjection(sanitizedBody.description) || hasNoSQLInjection(sanitizedBody.description)))
    ) {
      logger.security('injection-attempt', { ip, path: '/api/tasks', type: 'create' });
      return errorResponse(
        'Invalid input detected',
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR
      );
    }

    const validatedData = createTaskSchema.parse(sanitizedBody);

    // Process dueDate
    const taskData: Record<string, unknown> = {
      ...validatedData,
      user: authUser.userId,
    };

    if (validatedData.dueDate && validatedData.dueDate !== '') {
      taskData.dueDate = new Date(validatedData.dueDate);
    } else {
      delete taskData.dueDate;
    }

    const task = new Task(taskData);
    await task.save();

    logger.api('POST', '/api/tasks', HttpStatus.CREATED, authUser.userId);

    const response = successResponse(
      { task },
      'Task created successfully',
      HttpStatus.CREATED
    );

    return addSecurityHeaders(response);
  } catch (error) {
    logger.error('Create task error', error);

    if (error instanceof ZodError) {
      return handleZodError(error);
    }

    return errorResponse(
      'An error occurred while creating the task',
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.INTERNAL_ERROR
    );
  }
}
