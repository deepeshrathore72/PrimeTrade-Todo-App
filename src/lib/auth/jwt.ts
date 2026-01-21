import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  // Use type assertion to handle the expiresIn type
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  return Date.now() >= decoded.exp * 1000;
}
