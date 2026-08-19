import bcrypt from "bcrypt";
import crypto from "crypto";

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * bcrypt silently truncates input at 72 bytes, which is unsafe for
 * long values like JWTs (refresh tokens routinely exceed that). Use a
 * plain SHA-256 digest for hashing/comparing refresh tokens instead —
 * we're not protecting against offline guessing here (a JWT already
 * has full entropy), just avoiding storing the raw token in the DB.
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function compareTokenHash(token: string, hash: string): boolean {
  return hashToken(token) === hash;
}
