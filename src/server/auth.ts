import {
  hashSecret,
  id,
  nowIso,
  randomToken,
  runtimeEnv,
} from "./db";

const SESSION_DAYS = 7;

export async function createLoginToken(staffUserId: string): Promise<string> {
  const token = randomToken();
  const current = nowIso();
  const expiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  const database = runtimeEnv().DB;
  await database.batch([
    database
      .prepare(
        `UPDATE login_tokens SET used_at = ?
         WHERE staff_user_id = ? AND used_at IS NULL`,
      )
      .bind(current, staffUserId),
    database
      .prepare(
        `INSERT INTO login_tokens (id, staff_user_id, token_hash, expires_at, created_at)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .bind(id(), staffUserId, await hashSecret(token), expiry, current),
  ]);
  return token;
}

export async function consumeLoginToken(token: string): Promise<{
  staffUserId: string;
  name: string;
  email: string;
  role: "admin" | "staff" | "readonly";
} | null> {
  const database = runtimeEnv().DB;
  const claimTime = nowIso();
  const claimed = await database.prepare(
    `UPDATE login_tokens SET used_at = ?
     WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?
     RETURNING staff_user_id`,
  )
    .bind(claimTime, await hashSecret(token), claimTime)
    .first<{ staff_user_id: string }>();
  if (!claimed) return null;
  const row = await database.prepare(
    `SELECT id, name, email, role FROM staff_users
     WHERE id = ? AND active = 1`,
  )
    .bind(claimed.staff_user_id)
    .first<{ id: string; name: string; email: string; role: "admin" | "staff" | "readonly" }>();
  if (!row) return null;
  return { staffUserId: row.id, name: row.name, email: row.email, role: row.role };
}

export async function createSession(staffUserId: string): Promise<{ value: string; expiresAt: string }> {
  const value = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();
  const current = nowIso();
  await runtimeEnv().DB.prepare(
    `INSERT INTO sessions (id, staff_user_id, session_hash, expires_at, created_at, last_seen_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )
    .bind(id(), staffUserId, await hashSecret(value), expiresAt, current, current)
    .run();
  return { value, expiresAt };
}

export async function getStaffBySession(value: string | undefined) {
  if (!value) return null;
  const row = await runtimeEnv().DB.prepare(
    `SELECT s.id AS session_id, su.id, su.name, su.email, su.role
     FROM sessions s JOIN staff_users su ON su.id = s.staff_user_id
     WHERE s.session_hash = ? AND s.revoked_at IS NULL AND s.expires_at > ? AND su.active = 1`,
  )
    .bind(await hashSecret(value), nowIso())
    .first<{ session_id: string; id: string; name: string; email: string; role: "admin" | "staff" | "readonly" }>();
  if (!row) return null;
  await runtimeEnv().DB.prepare(`UPDATE sessions SET last_seen_at = ? WHERE id = ?`)
    .bind(nowIso(), row.session_id)
    .run();
  return { id: row.id, name: row.name, email: row.email, role: row.role };
}

export async function revokeSession(value: string | undefined): Promise<void> {
  if (!value) return;
  await runtimeEnv().DB.prepare(`UPDATE sessions SET revoked_at = ? WHERE session_hash = ?`)
    .bind(nowIso(), await hashSecret(value))
    .run();
}
