'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const styles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const iconStyles = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

const ToastItem: React.FC<{ toast: Toast; onRemove: () => void }> = ({
  toast,
  onRemove,
}) => {
  const Icon = icons[toast.type];

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.duration, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg min-w-[320px] max-w-md',
        styles[toast.type]
      )}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', iconStyles[toast.type])} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{toast.title}</p>
        {toast.message && (
          <p className="text-sm opacity-80 mt-0.5">{toast.message}</p>
        )}
      </div>
      <button
        onClick={onRemove}
        className="flex-shrink-0 p-1 hover:bg-black/5 rounded transition-colors"
      >
        <X className="w-4 h-4 opacity-60" />
      </button>
    </motion.div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onRemove={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

// Standalone Toaster component for use in layout
export const Toaster: React.FC = () => {
  return null; // The actual toasts are rendered by ToastProvider
};

// Create a simple toast function for non-context use
let toastFn: ((toast: Omit<Toast, 'id'>) => void) | null = null;

export const setToastFunction = (fn: (toast: Omit<Toast, 'id'>) => void) => {
  toastFn = fn;
};

export const toast = {
  success: (title: string, message?: string) => {
    toastFn?.({ type: 'success', title, message });
  },
  error: (title: string, message?: string) => {
    toastFn?.({ type: 'error', title, message });
  },
  warning: (title: string, message?: string) => {
    toastFn?.({ type: 'warning', title, message });
  },
  info: (title: string, message?: string) => {
    toastFn?.({ type: 'info', title, message });
  },
};
