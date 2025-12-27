import { createHash } from "crypto";

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
