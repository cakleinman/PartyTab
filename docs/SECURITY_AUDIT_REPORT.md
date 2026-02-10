# PartyTab Security Audit Report

**Date:** February 1, 2026
**Auditor:** Senior Security Developer (AI-assisted)
**Framework:** OWASP Top 10 (2021) + ASVS 4.0
**Scope:** Full codebase review - authentication, API routes, cryptography, dependencies, configurations

---

## Executive Summary

PartyTab is a Next.js 16 expense-splitting application with NextAuth authentication, Prisma ORM, Supabase storage, and Stripe billing. This comprehensive security audit identified **18 findings** across multiple risk levels:

| Severity | Count |
|----------|-------|
| **CRITICAL** | 2 |
| **HIGH** | 5 |
| **MEDIUM** | 6 |
| **LOW** | 5 |

**Key Concerns:**
- Exposed production secrets in local .env file
- Weak PIN-based authentication vulnerable to brute force
- Known dependency vulnerabilities in Next.js
- Missing security headers
- IDOR vulnerabilities in acknowledgement endpoints

---

## OWASP Top 10 Mapping

### A01:2021 - Broken Access Control ⚠️ HIGH

| ID | Finding | Severity | ASVS |
|----|---------|----------|------|
| A01-01 | **IDOR in Acknowledgements POST** - `/app/api/tabs/[tabId]/acknowledgements/route.ts` lacks participant verification before `initiateAcknowledgement()` | HIGH | V4.2.1 |
| A01-02 | **IDOR in Acknowledgements Confirm** - `/app/api/tabs/[tabId]/acknowledgements/confirm/route.ts` missing `requireParticipant()` check | HIGH | V4.2.1 |
| A01-03 | **Authorization after expensive operations** - Receipt parse endpoint checks Pro status before authorization | LOW | V4.1.1 |

**Evidence:**
```typescript
// app/api/tabs/[tabId]/acknowledgements/route.ts (lines 29-66)
// POST endpoint does NOT verify user is a tab participant
export async function POST(request: Request, ...) {
  const user = await getUserFromSession();
  // Missing: await requireParticipant(tabId, user.id);
  return initiateAcknowledgement(tabId, body, user.id);
}
```

**Remediation:**
- Add `requireParticipant(tabId, user.id)` at the start of all tab-scoped endpoints
- Implement consistent authorization middleware pattern

---

### A02:2021 - Cryptographic Failures ⚠️ CRITICAL

| ID | Finding | Severity | ASVS |
|----|---------|----------|------|
| A02-01 | **Weak PIN hashing** - SHA-256 with hardcoded salt, no key stretching | CRITICAL | V2.4.1 |
| A02-02 | **Production secrets in .env file** - Database credentials, API keys exposed | CRITICAL | V6.4.1 |
| A02-03 | **4-digit PIN brute-forceable** - Only 10,000 combinations | HIGH | V2.2.1 |

**Evidence (PIN hashing):**
```typescript
// lib/auth/pin.ts (lines 7-9)
export function hashPin(pin: string): string {
  const salt = "partytab-pin-salt-v1";  // HARDCODED SALT
  return createHash("sha256").update(`${salt}:${pin}`).digest("hex");
}
```

**Evidence (.env exposure):**
```bash
# .env file contains production secrets:
DATABASE_URL="postgresql://postgres.tygdysxknxzkqqdkazxn:aZDHvydr83Wc3t0j@..."
ANTHROPIC_API_KEY="sk-ant-api03-3b7-1iGNC_bcirtQ0Yu5nIXn2pu5..."
GOOGLE_CLIENT_SECRET="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"
STRIPE_SECRET_KEY="sk_test_51LkVBzJn1oNakqSYn8PMFyVEsGU..."
```

**Remediation:**
- Replace SHA-256 PIN hashing with bcrypt or Argon2 with unique salts
- Increase PIN length to 6 digits minimum
- Implement rate limiting on PIN attempts
- Rotate ALL exposed secrets immediately
- Use environment variable management (Vercel env, AWS Secrets Manager)

---

### A03:2021 - Injection ✅ LOW RISK

| ID | Finding | Severity | ASVS |
|----|---------|----------|------|
| A03-01 | **SQL Injection** - Mitigated via Prisma ORM parameterized queries | PASS | V5.3.4 |
| A03-02 | **XSS in emails** - Properly escaped via `escapeHtml()` function | PASS | V5.3.3 |
| A03-03 | **Template string usage** - Used only for logging, not user input | PASS | V5.2.4 |

**Positive Finding:**
```typescript
// lib/email/client.ts (lines 11-20)
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
```

---

### A04:2021 - Insecure Design ⚠️ MEDIUM

| ID | Finding | Severity | ASVS |
|----|---------|----------|------|
| A04-01 | **No rate limiting** - Authentication endpoints unprotected | HIGH | V11.1.7 |
| A04-02 | **Account enumeration** - Registration reveals existing emails | MEDIUM | V2.2.3 |
| A04-03 | **PIN timing attack possible** - `verifyPin()` uses string comparison | LOW | V2.2.1 |

**Evidence (No rate limiting):**
```typescript
// app/api/signin/route.ts - No rate limiting implementation
export async function POST(request: Request) {
  const body = await request.json();
  // No rate limiting checks
  const user = await prisma.user.findFirst({
    where: { displayName, pinHash },
  });
}
```

**Evidence (Account enumeration):**
```typescript
// app/api/auth/register/route.ts (lines 44-49)
if (existingUser) {
  throwApiError(409, "email_exists", "An account with this email already exists");
}
// Reveals whether email is registered
```

**Remediation:**
- Implement rate limiting (e.g., `@vercel/edge-rate-limiter` or Redis-based)
- Return generic errors for registration regardless of email existence
- Use timing-safe comparison for PIN verification

---

### A05:2021 - Security Misconfiguration ⚠️ HIGH

| ID | Finding | Severity | ASVS |
|----|---------|----------|------|
| A05-01 | **No security headers** - Missing CSP, X-Frame-Options, etc. | HIGH | V14.4.1 |
| A05-02 | **Empty Next.js config** - No security hardening | MEDIUM | V14.4.3 |
| A05-03 | **Cron endpoint partially protected** - Weak authentication | MEDIUM | V13.1.4 |

**Evidence (No security headers):**
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  /* config options here */  // EMPTY - no headers configured
};
```

**Evidence (Weak cron protection):**
```typescript
// app/api/reminders/run/route.ts (lines 17-20)
if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
// Falls through if CRON_SECRET is not set!
```

**Remediation:**
Add to `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }];
  },
};
```

---

### A06:2021 - Vulnerable and Outdated Components ⚠️ HIGH

| ID | Finding | Severity | ASVS |
|----|---------|----------|------|
| A06-01 | **Next.js 16.1.1 vulnerabilities** - 3 known CVEs | HIGH | V14.2.1 |

**Evidence (npm audit):**
```json
{
  "next": {
    "severity": "high",
    "via": [
      {"title": "DoS via Image Optimizer", "severity": "moderate"},
      {"title": "Unbounded Memory Consumption via PPR", "severity": "moderate"},
      {"title": "HTTP request deserialization DoS", "severity": "high", "range": ">=16.1.0 <16.1.5"}
    ],
    "fixAvailable": {"name": "next", "version": "16.1.6"}
  }
}
```

**Remediation:**
```bash
npm update next@16.1.6
```

---

### A07:2021 - Identification and Authentication Failures ⚠️ HIGH

| ID | Finding | Severity | ASVS |
|----|---------|----------|------|
| A07-01 | **Weak password policy** - Only 8 character minimum | MEDIUM | V2.1.7 |
| A07-02 | **No account lockout** - Unlimited login attempts | HIGH | V2.2.1 |
| A07-03 | **Session cookie missing expiry** - Guest sessions never expire | MEDIUM | V3.3.1 |

**Evidence (Weak password validation):**
```typescript
// lib/auth/password.ts (lines 26-31)
export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
  return null;  // No complexity requirements!
}
```

**Evidence (No session expiry):**
```typescript
// lib/session/session.ts (lines 53-61)
cookieStore.set(SESSION_COOKIE, value, {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  // Missing: maxAge or expires
});
```

**Remediation:**
- Add password complexity requirements (uppercase, lowercase, number, special char)
- Implement progressive delays or lockout after failed attempts
- Set `maxAge` on session cookies (e.g., 30 days for guest, 7 days idle timeout)

---

### A08:2021 - Software and Data Integrity Failures ✅ GOOD

| ID | Finding | Severity | ASVS |
|----|---------|----------|------|
| A08-01 | **Stripe webhook signature verification** - Properly implemented | PASS | V13.2.5 |
| A08-02 | **Webhook idempotency** - Events deduplicated via database | PASS | V13.2.3 |

**Positive Finding:**
```typescript
// app/api/stripe/webhook/route.ts (lines 27-32)
try {
  event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
} catch (err) {
  return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
}
```

---

### A09:2021 - Security Logging and Monitoring Failures ⚠️ MEDIUM

| ID | Finding | Severity | ASVS |
|----|---------|----------|------|
| A09-01 | **No authentication event logging** - Failed logins not logged | MEDIUM | V7.1.1 |
| A09-02 | **No security alerting** - No anomaly detection | MEDIUM | V7.2.1 |

**Remediation:**
- Log authentication attempts (success/failure) with IP address
- Implement alerting for suspicious patterns (brute force, credential stuffing)

---

### A10:2021 - Server-Side Request Forgery (SSRF) ✅ LOW RISK

| ID | Finding | Severity | ASVS |
|----|---------|----------|------|
| A10-01 | **No SSRF vectors identified** - App doesn't fetch arbitrary URLs | PASS | V12.6.1 |

---

## ASVS 4.0 Additional Findings

### V4: Access Control

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| V4.1.1 | Application enforces access control rules on trusted server side | ⚠️ PARTIAL | Some endpoints delegate to helpers |
| V4.2.1 | Sensitive data and APIs protected against IDOR | ❌ FAIL | Acknowledgement endpoints vulnerable |
| V4.3.1 | Administrative interfaces access controls | ✅ PASS | No admin interface exposed |

### V5: Validation, Sanitization and Encoding

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| V5.1.1 | Input validation on server side | ✅ PASS | Zod schemas used consistently |
| V5.2.1 | Unstructured data sanitized | ✅ PASS | HTML escaping in emails |
| V5.3.4 | Parameterized queries | ✅ PASS | Prisma ORM prevents SQL injection |

### V6: Cryptography

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| V6.2.1 | Cryptographic primitives appropriate | ❌ FAIL | SHA-256 for PINs without PBKDF |
| V6.4.1 | Secret management | ❌ FAIL | Secrets in .env file |

### V11: Business Logic

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| V11.1.7 | Business logic rate limited | ❌ FAIL | No rate limiting |

---

## Risk Matrix

| Finding | Likelihood | Impact | Risk Score |
|---------|------------|--------|------------|
| Exposed production secrets | HIGH | CRITICAL | **CRITICAL** |
| Weak PIN hashing | HIGH | HIGH | **CRITICAL** |
| No rate limiting | HIGH | MEDIUM | **HIGH** |
| Next.js vulnerabilities | MEDIUM | HIGH | **HIGH** |
| IDOR in acknowledgements | MEDIUM | MEDIUM | **HIGH** |
| Missing security headers | HIGH | LOW | **MEDIUM** |
| Account enumeration | HIGH | LOW | **MEDIUM** |
| Weak password policy | MEDIUM | MEDIUM | **MEDIUM** |

---

## Prioritized Remediation Plan

### Immediate (24-48 hours)
1. **ROTATE ALL SECRETS** - Database, API keys, OAuth credentials
2. **Update Next.js** to 16.1.6+ (`npm update next`)
3. **Add security headers** to `next.config.ts`

### Short-term (1 week)
4. **Fix IDOR vulnerabilities** - Add `requireParticipant()` to acknowledgement endpoints
5. **Implement rate limiting** - Use Redis or Vercel Edge Rate Limiter
6. **Upgrade PIN security** - Replace SHA-256 with bcrypt, increase to 6 digits

### Medium-term (2-4 weeks)
7. **Add session expiry** - Set `maxAge` on cookies
8. **Strengthen password policy** - Add complexity requirements
9. **Fix account enumeration** - Generic registration errors
10. **Add security logging** - Authentication event tracking

### Long-term (1-3 months)
11. **Implement MFA** - TOTP or WebAuthn for authenticated users
12. **Security monitoring** - Set up alerting for anomalies
13. **Penetration testing** - External security assessment

---

## Conclusion

PartyTab has a solid foundation with proper input validation (Zod), safe database queries (Prisma), and correct Stripe webhook verification. However, critical issues exist around secret management, PIN-based authentication security, and missing security headers.

The most urgent items are:
1. Rotating all exposed credentials
2. Updating Next.js to patch known vulnerabilities
3. Implementing rate limiting to prevent brute-force attacks

With the recommended fixes, the application security posture will significantly improve.

---

*Report generated by comprehensive security audit against OWASP Top 10 (2021) and ASVS 4.0 standards.*
