import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export { generateToken, verifyToken, decodeToken, isTokenExpired } from './jwt';
export type { JWTPayload } from './jwt';
export {
  getTokenFromRequest,
  authenticateRequest,
  createAuthErrorResponse,
  withAuth,
} from './middleware';
