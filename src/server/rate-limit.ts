import { hashSecret, nowIso, runtimeEnv } from "./db";

interface RateLimitOptions {
  scope: string;
  key: string;
  limit: number;
  windowMs: number;
}

/** Increment a fixed-window counter without retaining the raw identifier. */
export async function withinRateLimit({
  scope,
  key,
  limit,
  windowMs,
}: RateLimitOptions): Promise<boolean> {
  const windowStart = Math.floor(Date.now() / windowMs) * windowMs;
  const result = await runtimeEnv()
    .DB.prepare(
      `INSERT INTO rate_limits (scope, key_hash, window_start, attempts, updated_at)
       VALUES (?, ?, ?, 1, ?)
       ON CONFLICT(scope, key_hash, window_start)
       DO UPDATE SET attempts = attempts + 1, updated_at = excluded.updated_at
       RETURNING attempts`,
    )
    .bind(scope, await hashSecret(key), windowStart, nowIso())
    .first<{ attempts: number }>();
  return Number(result?.attempts ?? limit + 1) <= limit;
}

export function requestIp(request: Request): string {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    "unknown"
  );
}
