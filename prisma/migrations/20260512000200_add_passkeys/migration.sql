-- Phase 5: passwordless passkey sign-in (WebAuthn discoverable credentials).

CREATE TABLE "Passkey" (
  "id"           UUID         PRIMARY KEY,
  "userId"       UUID         NOT NULL,
  "credentialId" BYTEA        NOT NULL,
  "publicKey"    BYTEA        NOT NULL,
  "counter"      BIGINT       NOT NULL DEFAULT 0,
  "transports"   TEXT[]       NOT NULL DEFAULT '{}',
  "deviceName"   TEXT,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastUsedAt"   TIMESTAMP(3),

  CONSTRAINT "Passkey_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "Passkey_credentialId_key" ON "Passkey" ("credentialId");
CREATE INDEX "Passkey_userId_idx" ON "Passkey" ("userId");

-- RLS deny-all to match the project convention. Prisma uses the service-role
-- bypass; PostgREST roles get no access.
ALTER TABLE "Passkey" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Passkey_deny_anon"
  ON "Passkey" FOR ALL TO anon
  USING (false) WITH CHECK (false);

CREATE POLICY "Passkey_deny_authenticated"
  ON "Passkey" FOR ALL TO authenticated
  USING (false) WITH CHECK (false);
