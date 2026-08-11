import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const BCRYPT_ROUNDS = 10;
const LEGACY_SHA256_PATTERN = /^[a-f0-9]{64}$/i;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (storedHash.startsWith('$2')) {
    return bcrypt.compare(password, storedHash);
  }

  // Temporary compatibility for existing SHA-256 records. Successful logins
  // are transparently upgraded to bcrypt by the login route.
  if (LEGACY_SHA256_PATTERN.test(storedHash)) {
    const candidate = crypto.createHash('sha256').update(password).digest();
    const expected = Buffer.from(storedHash, 'hex');
    return expected.length === candidate.length && crypto.timingSafeEqual(candidate, expected);
  }

  return false;
}

export function passwordNeedsUpgrade(storedHash: string): boolean {
  return !storedHash.startsWith('$2');
}
