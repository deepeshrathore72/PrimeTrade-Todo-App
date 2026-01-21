'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  fallback,
  size = 'md',
  className,
}) => {
  const [imageError, setImageError] = React.useState(false);

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={alt || fallback}
        onError={() => setImageError(true)}
        className={cn(
          'rounded-full object-cover ring-2 ring-white shadow-sm',
          sizes[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center font-semibold text-white ring-2 ring-white shadow-sm',
        sizes[size],
        className
      )}
    >
      {fallback}
    </div>
  );
};
