# Passkey sign-in

PartyTab supports passwordless sign-in via passkeys (WebAuthn discoverable
credentials). Users enrol from the Settings page; once enrolled they can sign
in with their fingerprint, Face ID, or device PIN instead of typing a password.

## Architecture

The flow follows the standard NextAuth-idiomatic pattern: the Credentials
provider's `authorize` callback in `lib/auth/config.ts` does the WebAuthn
verification itself. The browser calls `signIn("passkey", { assertion })`
directly, which lets NextAuth mint the session — we never have to set
auth cookies from a route handler.

### Enrolment

1. Client calls `POST /api/me/passkeys/enroll/challenge`. The route generates
   `PublicKeyCredentialCreationOptions` via `@simplewebauthn/server`,
   stores the challenge in an HMAC-signed cookie (`partytab_passkey_challenge`,
   `SameSite=Strict`, 5-min TTL), and returns the options to the client.
2. Client runs `startRegistration({ optionsJSON })` from
   `@simplewebauthn/browser`. The OS shows the biometric prompt.
3. Client posts the registration response to `POST /api/me/passkeys/enroll/verify`,
   which:
   - Pulls the challenge cookie back out and verifies the HMAC signature.
   - Calls `verifyRegistrationResponse` from `@simplewebauthn/server`.
   - On success, persists a `Passkey` row (credentialId, publicKey, counter,
     transports, deviceName) and deletes the challenge cookie.

### Sign-in (passwordless)

1. Client calls `POST /api/auth/passkey/challenge` (unauthenticated). Returns
   `PublicKeyCredentialRequestOptions` with empty `allowCredentials` so the
   browser surfaces any discoverable credential bound to this RP.
2. Client runs `startAuthentication({ optionsJSON })`. User taps fingerprint.
3. Client calls `signIn("passkey", { assertion: JSON.stringify(...) })`.
4. The `"passkey"` Credentials provider in `lib/auth/config.ts`:
   - Reads + verifies the challenge cookie.
   - Looks up the `Passkey` row by `credentialId`.
   - Calls `verifyAuthenticationResponse` with the stored publicKey.
   - On success: bumps `counter`, sets `lastUsedAt`, returns the user record.
   - NextAuth mints the session JWT from the returned user.

## Configuration

`lib/passkeys/config.ts` derives `RP_ID` from `APP_BASE_URL`:

| `APP_BASE_URL`              | `RP_ID`            |
|-----------------------------|--------------------|
| `https://partytab.app`      | `partytab.app`     |
| `https://staging.partytab.app` | `staging.partytab.app` |
| _(unset, dev)_              | `localhost`        |

WebAuthn binds passkeys to the exact RP ID. A passkey enrolled against
`localhost` will not authenticate against `partytab.app` (and vice versa).

## Recovery

Passkeys never replace email/password — they're an opt-in additional
sign-in method. If a user loses every device that has the passkey, they can
still sign in with their password (or Google) and re-enrol. No backup codes
are surfaced in v1 by design: the password fallback is the recovery path.

## Operations notes

- `Passkey.counter` is `BIGINT`. The replay-detection counter rarely exceeds
  the JS safe integer range, but BIGINT is the correct WebAuthn type.
- The `Passkey` table has RLS deny-all on `anon` and `authenticated` roles to
  match the project convention. All access is via Prisma (service-role).
- `credentialId` is unique. Re-enrolment on the same device replaces the
  existing row via the `excludeCredentials` mechanism in the enrol challenge.
