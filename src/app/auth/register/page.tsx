'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Check, X, Loader2, Shield, Zap, Target } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toaster';
import { registerSchema } from '@/lib/validations';
import { ZodError } from 'zod';

const passwordRequirements = [
  { label: 'At least 6 characters', test: (p: string) => p.length >= 6 },
  { label: 'Contains uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Contains lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Contains number', test: (p: string) => /\d/.test(p) },
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { register, loginWithGoogle, loginWithGithub } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!agreedToTerms) {
      toast.error('Terms Required', 'Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setIsLoading(true);

    try {
      // Validate form data
      registerSchema.parse(formData);

      // Attempt registration
      await register(formData);
      toast.success('Welcome!', 'Your account has been created successfully.');
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
        toast.error('Registration failed', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      toast.error('Google Sign Up Failed', 'Please try again');
    }
  };

  const handleGithubSignup = async () => {
    try {
      await loginWithGithub();
    } catch (error) {
      toast.error('GitHub Sign Up Failed', 'Please try again');
    }
  };

  const getPasswordStrength = () => {
    const passed = passwordRequirements.filter(req => req.test(formData.password)).length;
    if (passed === 0) return { label: '', color: '', width: '0%' };
    if (passed === 1) return { label: 'Weak', color: 'bg-red-500', width: '25%' };
    if (passed === 2) return { label: 'Fair', color: 'bg-orange-500', width: '50%' };
    if (passed === 3) return { label: 'Good', color: 'bg-yellow-500', width: '75%' };
    return { label: 'Strong', color: 'bg-green-500', width: '100%' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md py-8"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                <span className="text-white font-bold text-lg">PT</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent">PrimeTrade</span>
            </Link>
          </div>

          <div className="mb-8">
            <motion.h2 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-bold text-slate-900 mb-2"
            >
              Create your account
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-600"
            >
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="text-primary-600 hover:text-primary-700 font-semibold hover:underline"
              >
                Sign in
              </Link>
            </motion.p>
          </div>

          {/* OAuth Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 gap-3 mb-6"
          >
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="h-12 hover:bg-slate-50 border-slate-200 hover:border-slate-300 transition-all"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleGithubSignup}
              disabled={isLoading}
              className="h-12 hover:bg-slate-50 border-slate-200 hover:border-slate-300 transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </Button>
          </motion.div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-500">
                or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                error={errors.firstName}
                leftIcon={<User className="w-5 h-5" />}
                disabled={isLoading}
              />
              <Input
                label="Last name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                error={errors.lastName}
                disabled={isLoading}
              />
            </div>

            <Input
              label="Email address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              error={errors.email}
              leftIcon={<Mail className="w-5 h-5" />}
              disabled={isLoading}
            />

            <div className="space-y-2">
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  error={errors.password}
                  leftIcon={<Lock className="w-5 h-5" />}
                  disabled={isLoading}
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

              {/* Password Strength Indicator */}
              {formData.password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: passwordStrength.width }}
                        className={`h-full ${passwordStrength.color} rounded-full transition-all`}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength.label === 'Strong' ? 'text-green-600' :
                      passwordStrength.label === 'Good' ? 'text-yellow-600' :
                      passwordStrength.label === 'Fair' ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {passwordRequirements.map((req, index) => (
                      <motion.div
                        key={req.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-1.5"
                      >
                        {req.test(formData.password) ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-slate-300" />
                        )}
                        <span className={`text-xs ${req.test(formData.password) ? 'text-green-600' : 'text-slate-400'}`}>
                          {req.label}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <div className="relative">
              <Input
                label="Confirm password"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                error={errors.confirmPassword}
                leftIcon={<Lock className="w-5 h-5" />}
                disabled={isLoading}
                success={formData.confirmPassword !== '' && formData.password === formData.confirmPassword}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500 mt-0.5 cursor-pointer"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-slate-600 cursor-pointer">
                I agree to the{' '}
                <Link href="#" className="text-primary-600 hover:text-primary-700 font-medium hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="#" className="text-primary-600 hover:text-primary-700 font-medium hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              variant="gradient"
              className="w-full"
              size="lg"
              isLoading={isLoading}
              disabled={!agreedToTerms}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-violet-700 p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-white/5 to-transparent rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">PT</span>
              </div>
              <span className="text-2xl font-bold text-white">PrimeTrade</span>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold text-white mb-4">
              Start your journey to productivity
            </h1>
            <p className="text-primary-100 text-lg mb-10">
              Join thousands of users who are managing their tasks efficiently and
              achieving their goals with our powerful task management platform.
            </p>

            <div className="space-y-5">
              {[
                { icon: Target, text: 'Unlimited task management', desc: 'Create and organize unlimited tasks' },
                { icon: Shield, text: 'Enterprise-grade security', desc: 'Your data is encrypted and secure' },
                { icon: Zap, text: 'Priority-based organization', desc: 'Focus on what matters most' },
              ].map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-start space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-white font-semibold block">{feature.text}</span>
                    <span className="text-primary-200 text-sm">{feature.desc}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="text-primary-200 text-sm">
            © 2026 PrimeTrade. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
