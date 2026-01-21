'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toaster';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      emailSchema.parse(email);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
        return;
      }
    }

    setIsLoading(true);

    try {
      // Simulate API call - replace with actual implementation
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // In a real app, you would call your password reset API here
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });

      setIsSubmitted(true);
      toast.success('Email sent!', 'Check your inbox for password reset instructions.');
    } catch (error) {
      toast.error('Failed to send', 'Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-green-500" />
            </motion.div>

            <h1 className="text-2xl font-bold text-slate-900 mb-2">Check your email</h1>
            <p className="text-slate-600 mb-6">
              We&apos;ve sent password reset instructions to:
            </p>
            <p className="text-slate-900 font-medium bg-slate-100 rounded-lg px-4 py-2 mb-6">
              {email}
            </p>
            <p className="text-sm text-slate-500 mb-8">
              Didn&apos;t receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                try a different email
              </button>
            </p>

            <Link href="/auth/login">
              <Button variant="outline" className="w-full" size="lg">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Sign In
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">PT</span>
            </div>
            <span className="text-xl font-bold text-slate-800">TaskFlow</span>
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Forgot password?</h1>
            <p className="text-slate-600">
              No worries, we&apos;ll send you reset instructions.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="Enter your email"
              error={error}
              leftIcon={<Mail className="w-5 h-5" />}
              disabled={isLoading}
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              {isLoading ? 'Sending...' : 'Reset Password'}
              {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
            </Button>
          </form>

          {/* Back Link */}
          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
