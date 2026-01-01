const REQUIRED_ENV = ["DATABASE_URL", "SESSION_SECRET", "APP_BASE_URL"] as const;

type EnvStatus = {
  ok: boolean;
  missing: string[];
};

export function getEnvStatus(): EnvStatus {
  if (!process.env.DATABASE_URL && process.env.DATABASE_URL_LOCAL) {
    process.env.DATABASE_URL = process.env.DATABASE_URL_LOCAL;
  }

  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  return {
    ok: missing.length === 0,
    missing,
  };
}
