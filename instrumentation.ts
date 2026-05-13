// Next.js instrumentation hook (https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation).
// Runs once per Node.js worker startup.

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // Warm bcrypt's JIT path so first-request login timing isn't an outlier.
  // The lockout flow in lib/auth/config.ts depends on bcrypt.compare timing
  // being uniform between "user not found" and "wrong password" — JIT cold
  // start can be ~3-5x slower than steady-state.
  try {
    const bcrypt = (await import("bcrypt")).default;
    // The hash is a valid $2b$12$ fixture; the password doesn't matter — we
    // only care that bcrypt.compare runs end-to-end once at startup.
    await bcrypt.compare(
      "warmup",
      "$2b$12$rkV9w2j5GZ.X4mYBLgkRyOQHmuVoYn8GxYpVoLkfg7Q/Z3ZHcgEna"
    );
  } catch {
    // Warming is best-effort; a failure here must not break boot.
  }
}
