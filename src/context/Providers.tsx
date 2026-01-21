'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from './AuthContext';
import { ToastProvider, setToastFunction, useToast } from '@/components/ui/Toaster';
import { useEffect } from 'react';

// Component to connect toast function
const ToastConnector: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToast } = useToast();

  useEffect(() => {
    setToastFunction(addToast);
  }, [addToast]);

  return <>{children}</>;
};

export const Providers: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <SessionProvider>
      <ToastProvider>
        <ToastConnector>
          <AuthProvider>{children}</AuthProvider>
        </ToastConnector>
      </ToastProvider>
    </SessionProvider>
  );
};
