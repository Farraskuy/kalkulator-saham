import { cookies } from 'next/headers';
import crypto from 'crypto';

const SECRET_KEY = process.env.SESSION_SECRET || 'kalkulator-saham-super-secret-key-2026';

export interface UserSessionPayload {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: 'USER' | 'ADMIN';
}

function signToken(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 30 * 86400 * 1000 })).toString('base64url'); // 30 hari
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken<T>(token: string): T | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', SECRET_KEY).update(`${header}.${body}`).digest('base64url');
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload as T;
  } catch {
    return null;
  }
}

// ADMIN SESSION
export async function createSession(email: string) {
  const token = signToken({ email, role: 'ADMIN' });
  const cookieStore = await cookies();
  cookieStore.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 86400,
  });
  return token;
}

export async function verifySession(): Promise<{ email: string } | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token) return null;
    return verifyToken<{ email: string }>(token);
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
}

// PUBLIC USER OAUTH SESSION
export async function createUserSession(user: UserSessionPayload) {
  const token = signToken(user);
  const cookieStore = await cookies();
  cookieStore.set('user_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 86400,
  });
  return token;
}

export async function verifyUserSession(): Promise<UserSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('user_token')?.value;
    if (!token) return null;
    return verifyToken<UserSessionPayload>(token);
  } catch {
    return null;
  }
}

export async function destroyUserSession() {
  const cookieStore = await cookies();
  cookieStore.delete('user_token');
}
