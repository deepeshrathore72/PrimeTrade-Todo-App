'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => {
  return (
    <Loader2
      className={cn('animate-spin text-primary-600', sizes[size], className)}
    />
  );
};

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Loading...',
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <Spinner size="lg" />
        <p className="text-slate-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
}) => {
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={cn(
        'bg-slate-200 animate-pulse',
        variantStyles[variant],
        className
      )}
      style={{
        width: width || '100%',
        height: height || (variant === 'text' ? '1em' : '100%'),
      }}
    />
  );
};
