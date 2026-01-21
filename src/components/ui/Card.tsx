'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  onClick,
}) => {
  const Component = hover ? motion.div : 'div';
  const motionProps = hover
    ? {
        whileHover: { y: -2, boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' },
        transition: { duration: 0.2 },
      }
    : {};

  return (
    <Component
      className={cn(
        'bg-white rounded-xl border border-slate-200 shadow-sm',
        hover && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </Component>
  );
};

export const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={cn('px-6 py-4 border-b border-slate-100', className)}>
    {children}
  </div>
);

export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={cn('px-6 py-4', className)}>{children}</div>
);

export const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div
    className={cn(
      'px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-xl',
      className
    )}
  >
    {children}
  </div>
);
