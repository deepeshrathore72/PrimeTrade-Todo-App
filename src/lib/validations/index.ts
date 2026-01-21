import { z } from 'zod';

// Auth Schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(50, 'First name cannot exceed 50 characters'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(50, 'Last name cannot exceed 50 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name cannot exceed 50 characters')
    .optional(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name cannot exceed 50 characters')
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio cannot exceed 500 characters')
    .optional(),
  avatar: z.string().url('Please provide a valid URL').optional().or(z.literal('')),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().optional(), // Optional for OAuth users setting password for first time
    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

// Schema for OAuth users setting password for first time
export const setPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmNewPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

// Task Schemas
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Task title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional(),
  status: z.enum(['todo', 'in-progress', 'completed']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDate: z.string().datetime().optional().or(z.literal('')),
  tags: z
    .array(z.string().max(30, 'Each tag cannot exceed 30 characters'))
    .max(10, 'Cannot have more than 10 tags')
    .default([]),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Task title is required')
    .max(200, 'Title cannot exceed 200 characters')
    .optional(),
  description: z
    .string()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional(),
  status: z.enum(['todo', 'in-progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  tags: z
    .array(z.string().max(30, 'Each tag cannot exceed 30 characters'))
    .max(10, 'Cannot have more than 10 tags')
    .optional(),
});

export const taskQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: z.enum(['todo', 'in-progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'dueDate', 'priority', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
