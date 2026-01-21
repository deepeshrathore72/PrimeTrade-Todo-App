'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, Home, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const errorMessages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: 'Server Configuration Error',
    description: 'There is a problem with the server configuration. Please contact support.',
  },
  AccessDenied: {
    title: 'Access Denied',
    description: 'You do not have permission to sign in. Please contact support if you believe this is an error.',
  },
  Verification: {
    title: 'Verification Error',
    description: 'The verification link may have expired or already been used. Please request a new one.',
  },
  OAuthSignin: {
    title: 'OAuth Sign In Error',
    description: 'Error occurred while signing in with OAuth provider. Please try again.',
  },
  OAuthCallback: {
    title: 'OAuth Callback Error',
    description: 'Error occurred during OAuth callback. Please try again.',
  },
  OAuthCreateAccount: {
    title: 'Account Creation Error',
    description: 'Could not create an account with this OAuth provider. Please try a different method.',
  },
  EmailCreateAccount: {
    title: 'Email Account Error',
    description: 'Could not create an account with this email. It may already be in use.',
  },
  Callback: {
    title: 'Callback Error',
    description: 'Error occurred during authentication callback. Please try again.',
  },
  OAuthAccountNotLinked: {
    title: 'Account Not Linked',
    description: 'This email is already associated with another account. Please sign in with your original provider.',
  },
  EmailSignin: {
    title: 'Email Sign In Error',
    description: 'The email sign in link may have expired. Please request a new one.',
  },
  CredentialsSignin: {
    title: 'Sign In Failed',
    description: 'Invalid email or password. Please check your credentials and try again.',
  },
  SessionRequired: {
    title: 'Session Required',
    description: 'Please sign in to access this page.',
  },
  Default: {
    title: 'Authentication Error',
    description: 'An unexpected error occurred during authentication. Please try again.',
  },
};

function ErrorPageContent() {
  const searchParams = useSearchParams();
  const errorType = searchParams.get('error') || 'Default';
  const { title, description } = errorMessages[errorType] || errorMessages.Default;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </motion.div>

        {/* Error Title */}
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>
        
        {/* Error Description */}
        <p className="text-slate-600 mb-8">{description}</p>

        {/* Error Code */}
        <div className="bg-slate-100 rounded-lg px-4 py-2 mb-8 inline-block">
          <code className="text-sm text-slate-600">Error: {errorType}</code>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href="/auth/login" className="block">
            <Button className="w-full" size="lg">
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </Button>
          </Link>

          <Link href="/" className="block">
            <Button variant="outline" className="w-full" size="lg">
              <Home className="w-5 h-5 mr-2" />
              Go to Home
            </Button>
          </Link>
        </div>

        {/* Help Link */}
        <p className="mt-6 text-sm text-slate-500">
          Need help?{' '}
          <Link href="/support" className="text-primary-600 hover:text-primary-700 font-medium">
            Contact Support
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

function ErrorPageFallback() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
        </div>
        <div className="h-6 bg-slate-200 rounded w-48 mx-auto mb-4 animate-pulse"></div>
        <div className="h-4 bg-slate-100 rounded w-64 mx-auto animate-pulse"></div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <Suspense fallback={<ErrorPageFallback />}>
        <ErrorPageContent />
      </Suspense>
    </div>
  );
}
