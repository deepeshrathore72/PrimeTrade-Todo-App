import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './jwt';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/db/mongoose';
import User from '@/lib/db/models/User';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export function getTokenFromRequest(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookies
  const tokenCookie = request.cookies.get('token');
  if (tokenCookie?.value) {
    return tokenCookie.value;
  }

  return null;
}

export async function authenticateRequest(
  request: NextRequest
): Promise<{ user: JWTPayload | null; error: string | null }> {
  // First, try NextAuth session token
  try {
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
    const nextAuthToken = await getToken({ req: request, secret });
    
    if (nextAuthToken?.email) {
      // Get user from database to get the userId
      await connectDB();
      const dbUser = await User.findOne({ email: nextAuthToken.email });
      
      if (dbUser) {
        return {
          user: {
            userId: dbUser._id.toString(),
            email: dbUser.email,
          },
          error: null,
        };
      }
    }
  } catch (error) {
    // NextAuth token check failed, continue to legacy token check
    console.error('NextAuth token check failed:', error);
  }

  // Fallback to legacy JWT token
  const token = getTokenFromRequest(request);

  if (!token) {
    return { user: null, error: 'No authentication token provided' };
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return { user: null, error: 'Invalid or expired token' };
  }

  return { user: decoded, error: null };
}

export function createAuthErrorResponse(message: string, status: number = 401): NextResponse {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
}

export function withAuth(
  handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const { user, error } = await authenticateRequest(request);

    if (error || !user) {
      return createAuthErrorResponse(error || 'Authentication required');
    }

    return handler(request, user);
  };
}
