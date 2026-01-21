'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Chrome, Github, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toaster';
import { loginSchema } from '@/lib/validations';
import { ZodError } from 'zod';

function LoginPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);
  const { login, loginWithGoogle, loginWithGithub } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const error = searchParams.get('error');

  // Show error from OAuth callback
  React.useEffect(() => {
    if (error) {
      toast.error('Authentication failed', 
        error === 'OAuthAccountNotLinked' 
          ? 'This email is already associated with another account. Please sign in with your original provider.'
          : 'Something went wrong. Please try again.'
      );
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      // Validate form data
      loginSchema.parse({ email, password });

      // Attempt login
      await login(email, password);
      toast.success('Welcome back!', 'You have been logged in successfully.');
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else if (error instanceof Error) {
        toast.error('Login failed', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setOauthLoading('google');
    try {
      await loginWithGoogle();
    } catch (error) {
      toast.error('Google login failed', 'Please try again.');
      setOauthLoading(null);
    }
  };

  const handleGithubLogin = async () => {
    setOauthLoading('github');
    try {
      await loginWithGithub();
    } catch (error) {
      toast.error('GitHub login failed', 'Please try again.');
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-12 relative overflow-hidden">
        {/* Animated background patterns */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        
        {/* Floating shapes */}
        <motion.div
          className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-40 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <Link href="/" className="flex items-center space-x-3 group">
              <motion.div 
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <span className="text-white font-bold text-xl">PT</span>
              </motion.div>
              <span className="text-2xl font-bold text-white group-hover:text-primary-100 transition-colors">TaskFlow</span>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary-200" />
              <span className="text-primary-200 font-medium">Enterprise-grade security</span>
            </div>
            
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              Welcome back to your productivity hub
            </h1>
            <p className="text-primary-100 text-lg leading-relaxed">
              Manage your tasks, track your progress, and achieve your goals with
              our powerful dashboard.
            </p>
            
            {/* Feature highlights */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <motion.div 
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3"
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                <Shield className="w-5 h-5 text-green-300" />
                <span className="text-white text-sm">Secure OAuth 2.0</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3"
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span className="text-white text-sm">Smart Dashboard</span>
              </motion.div>
            </div>
          </motion.div>

          <div className="text-primary-200 text-sm">
            © 2026 TaskFlow. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">PT</span>
              </div>
              <span className="text-xl font-bold text-slate-800">TaskFlow</span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Sign in</h2>
            <p className="text-slate-600">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/register"
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <motion.button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading || oauthLoading !== null}
              className="flex items-center justify-center w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {oauthLoading === 'google' ? (
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              ) : (
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continue with Google
            </motion.button>
            
            <motion.button
              type="button"
              onClick={handleGithubLogin}
              disabled={isLoading || oauthLoading !== null}
              className="flex items-center justify-center w-full px-4 py-3 border border-slate-800 rounded-xl text-white bg-slate-900 hover:bg-slate-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {oauthLoading === 'github' ? (
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              ) : (
                <Github className="w-5 h-5 mr-3" />
              )}
              Continue with GitHub
            </motion.button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">
                or sign in with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              error={errors.email}
              leftIcon={<Mail className="w-5 h-5" />}
              disabled={isLoading || oauthLoading !== null}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                error={errors.password}
                leftIcon={<Lock className="w-5 h-5" />}
                disabled={isLoading || oauthLoading !== null}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500 cursor-pointer"
                />
                <span className="ml-2 text-sm text-slate-600">Remember me</span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
              disabled={oauthLoading !== null}
            >
              Sign in
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </form>

          {/* Security badge */}
          <div className="mt-8 flex items-center justify-center gap-2 text-slate-500 text-sm">
            <Shield className="w-4 h-4" />
            <span>Secured with 256-bit encryption</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function LoginPageFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800"></div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="h-8 bg-slate-200 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-slate-100 rounded w-48 animate-pulse"></div>
          <div className="space-y-4">
            <div className="h-12 bg-slate-100 rounded-xl animate-pulse"></div>
            <div className="h-12 bg-slate-900/20 rounded-xl animate-pulse"></div>
          </div>
          <div className="h-px bg-slate-200"></div>
          <div className="space-y-4">
            <div className="h-12 bg-slate-100 rounded-lg animate-pulse"></div>
            <div className="h-12 bg-slate-100 rounded-lg animate-pulse"></div>
          </div>
          <div className="h-12 bg-primary-200 rounded-xl animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}
