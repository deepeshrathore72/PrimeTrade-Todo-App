'use client';

import React, { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  success?: boolean;
  showSuccessIcon?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      success,
      showSuccessIcon,
      className,
      id,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <div className="w-full">
        {label && (
          <motion.label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium mb-1.5 transition-colors duration-200',
              error ? 'text-red-600' : isFocused ? 'text-primary-600' : 'text-slate-700'
            )}
            animate={{ color: error ? '#dc2626' : isFocused ? '#0284c7' : '#334155' }}
          >
            {label}
          </motion.label>
        )}
        <div className="relative group">
          {leftIcon && (
            <div className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200',
              error ? 'text-red-400' : isFocused ? 'text-primary-500' : 'text-slate-400'
            )}>
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={cn(
              'w-full px-4 py-2.5 bg-white border-2 rounded-xl text-slate-900',
              'placeholder:text-slate-400',
              'focus:outline-none focus:ring-0',
              'transition-all duration-200 ease-out',
              'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
              error
                ? 'border-red-300 focus:border-red-500 bg-red-50/50'
                : success
                ? 'border-green-300 focus:border-green-500 bg-green-50/50'
                : 'border-slate-200 hover:border-slate-300 focus:border-primary-500 focus:bg-white',
              leftIcon && 'pl-11',
              (rightIcon || showSuccessIcon) && 'pr-11',
              className
            )}
            {...props}
          />
          {rightIcon && !error && !showSuccessIcon && (
            <div className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200',
              isFocused ? 'text-primary-500' : 'text-slate-400'
            )}>
              {rightIcon}
            </div>
          )}
          {showSuccessIcon && success && !error && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
            >
              <CheckCircle className="w-5 h-5" />
            </motion.div>
          )}
          
          {/* Focus ring animation */}
          <motion.div
            className={cn(
              'absolute inset-0 rounded-xl pointer-events-none',
              error ? 'ring-red-500/20' : 'ring-primary-500/20'
            )}
            initial={false}
            animate={{
              boxShadow: isFocused
                ? `0 0 0 4px ${error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(2, 132, 199, 0.1)'}`
                : '0 0 0 0px transparent',
            }}
            transition={{ duration: 0.2 }}
          />
        </div>
        
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-1.5 text-sm text-red-600 flex items-center"
            >
              <AlertCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
              {error}
            </motion.p>
          )}
          {helperText && !error && (
            <motion.p
              key="helper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-1.5 text-sm text-slate-500"
            >
              {helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';
