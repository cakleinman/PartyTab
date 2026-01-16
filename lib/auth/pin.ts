import { createHash, randomInt } from "crypto";

/**
 * Hash a 4-digit PIN for storage.
 * Uses SHA-256 with a salt for basic security.
 */
export function hashPin(pin: string): string {
  const salt = "partytab-pin-salt-v1";
  return createHash("sha256").update(`${salt}:${pin}`).digest("hex");
}

/**
 * Verify a PIN against a stored hash.
 */
export function verifyPin(pin: string, hash: string): boolean {
  return hashPin(pin) === hash;
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
