import bcrypt from "bcrypt";
import { randomInt } from "crypto";

const PIN_SALT_ROUNDS = 10;

/**
 * Hash a 4-digit PIN for storage using bcrypt.
 * bcrypt provides per-hash salt and key stretching.
 */
export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, PIN_SALT_ROUNDS);
}

/**
 * Verify a PIN against a stored hash using bcrypt.
 * bcrypt.compare is timing-safe.
 */
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

/**
 * Validate PIN format (4 digits).
 */
export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

/**
 * Generate a random 4-digit PIN.
 * Uses cryptographically secure randomness.
 */
export function generatePin(): string {
  return randomInt(0, 10000).toString().padStart(4, "0");
}
