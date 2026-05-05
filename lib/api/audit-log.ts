interface AuditEntry {
  timestamp: string;
  method: string;
  path: string;
  userId: string | null;
  statusCode: number;
  durationMs: number;
}

export function logApiRequest(entry: AuditEntry): void {
  console.log(JSON.stringify({ audit: true, ...entry }));
}
