'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  provider?: string;
  createdAt: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Sync NextAuth session with local state
  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true);
      return;
    }

    if (session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email || '',
        firstName: session.user.firstName || session.user.name?.split(' ')[0] || '',
        lastName: session.user.lastName || session.user.name?.split(' ').slice(1).join(' ') || '',
        avatar: session.user.image || '',
        createdAt: new Date().toISOString(),
      });
    } else {
      // Fallback to legacy auth check
      refreshUser();
    }

    setIsLoading(false);
  }, [session, status]);

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data?.user) {
          setUser(data.data.user);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error === 'CredentialsSignin' ? 'Invalid email or password' : result.error);
    }

    // Refresh to get user data
    await refreshUser();
    router.push('/dashboard');
  };

  const loginWithGoogle = async () => {
    await signIn('google', { callbackUrl: '/dashboard' });
  };

  const loginWithGithub = async () => {
    await signIn('github', { callbackUrl: '/dashboard' });
  };

  const register = async (registerData: RegisterData) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(registerData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    // Auto-login after registration
    await login(registerData.email, registerData.password);
  };

  const logout = async () => {
    try {
      // Sign out from NextAuth
      await signOut({ redirect: false });

      // Also clear legacy token
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      router.push('/');
    }
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        loginWithGithub,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
