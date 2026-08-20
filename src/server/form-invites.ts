import { hashSecret, nowIso, runtimeEnv } from "./db";

export interface InviteContact {
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
}

export async function getValidInviteContact(
  formSlug: string,
  token: string,
): Promise<InviteContact | null> {
  if (!token) return null;

  return runtimeEnv()
    .DB.prepare(
      `SELECT c.name, c.email, c.phone, o.name AS company
       FROM form_invites i
       JOIN contacts c ON c.id = i.contact_id
       LEFT JOIN organisations o ON o.id = c.organisation_id
       WHERE i.form_slug = ? AND i.token_hash = ?
         AND i.completed_at IS NULL AND i.revoked_at IS NULL AND i.expires_at > ?`,
    )
    .bind(formSlug, await hashSecret(token), nowIso())
    .first<InviteContact>();
}
