import { cookies } from 'next/headers';
import crypto from 'crypto';

function getSecretKey(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && (process.env.NODE_ENV !== 'production' || secret.length >= 32)) return secret;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET must be configured with at least 32 characters in production');
  }

  return 'development-only-secret';
}

export interface UserSessionPayload {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: 'USER' | 'ADMIN';
}

function signaturesMatch(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual, 'base64url');
  const expectedBuffer = Buffer.from(expected, 'base64url');
  return actualBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

function signToken(payload: object, maxAgeSeconds: number): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + maxAgeSeconds * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', getSecretKey()).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken<T>(token: string): T | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', getSecretKey()).update(`${header}.${body}`).digest('base64url');
    if (!signaturesMatch(signature, expectedSig)) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload as T;
  } catch {
    return null;
  }
}

// ADMIN SESSION
export async function createSession(email: string) {
  const maxAge = 86400;
  const token = signToken({ email, role: 'ADMIN' }, maxAge);
  const cookieStore = await cookies();
  cookieStore.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
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
  const maxAge = 30 * 86400;
  const token = signToken(user, maxAge);
  const cookieStore = await cookies();
  cookieStore.set('user_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
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

const OAUTH_STATE_COOKIE = 'oauth_state_nonce';

export async function createOAuthState(redirectPath: string): Promise<string> {
  const safeRedirect = redirectPath.startsWith('/') && !redirectPath.startsWith('//') ? redirectPath : '/';
  const nonce = crypto.randomBytes(32).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({ redirectPath: safeRedirect, nonce, exp: Date.now() + 10 * 60 * 1000 })
  ).toString('base64url');
  const signature = crypto.createHmac('sha256', getSecretKey()).update(payload).digest('base64url');

  const cookieStore = await cookies();
  cookieStore.set(OAUTH_STATE_COOKIE, nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 10 * 60,
  });

  return `${payload}.${signature}`;
}

export async function verifyOAuthState(state: string | null): Promise<string | null> {
  if (!state) return null;

  try {
    const [payload, signature] = state.split('.');
    if (!payload || !signature) return null;
    const expected = crypto.createHmac('sha256', getSecretKey()).update(payload).digest('base64url');
    if (!signaturesMatch(signature, expected)) return null;

    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      redirectPath?: string;
      nonce?: string;
      exp?: number;
    };
    const cookieStore = await cookies();
    const cookieNonce = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
    cookieStore.delete(OAUTH_STATE_COOKIE);

    if (!parsed.nonce || !cookieNonce || parsed.nonce !== cookieNonce || !parsed.exp || parsed.exp < Date.now()) {
      return null;
    }

    return parsed.redirectPath?.startsWith('/') && !parsed.redirectPath.startsWith('//')
      ? parsed.redirectPath
      : '/';
  } catch {
    return null;
  }
}
