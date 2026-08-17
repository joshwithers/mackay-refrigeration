import { escapeHtml, id, json, nowIso, runtimeEnv } from "./db";

interface EmailInput {
  contactId?: string;
  enquiryId?: string;
  template: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

function sender(): { from: string; name: string; replyTo?: string } {
  const current = runtimeEnv();
  return {
    from: current.SEND16_FROM_EMAIL || "mackayrefrig@mafia.net.au",
    name: current.SEND16_FROM_NAME || "Mackay Refrigeration",
    replyTo: current.SEND16_REPLY_TO || "service@mackayrefrig.com.au",
  };
}

export async function createCommunication(input: EmailInput): Promise<string> {
  const current = runtimeEnv();
  const createdAt = nowIso();
  const from = sender();
  const communicationId = id();
  await current.DB.prepare(
    `INSERT INTO communications
      (id, contact_id, enquiry_id, kind, template, to_email, from_email, reply_to,
       subject, text_body, html_body, status, created_at, updated_at)
     VALUES (?, ?, ?, 'email', ?, ?, ?, ?, ?, ?, ?, 'queued', ?, ?)`,
  )
    .bind(
      communicationId,
      input.contactId ?? null,
      input.enquiryId ?? null,
      input.template,
      input.to,
      from.from,
      input.replyTo || from.replyTo || null,
      input.subject,
      input.text,
      input.html,
      createdAt,
      createdAt,
    )
    .run();
  return communicationId;
}

export async function sendCommunication(
  communicationId: string,
): Promise<void> {
  const current = runtimeEnv();
  const row = await current.DB.prepare(
    `SELECT * FROM communications WHERE id = ?`,
  )
    .bind(communicationId)
    .first<Record<string, unknown>>();
  if (!row || row.status === "sent" || row.status === "delivered") return;

  const attempts = Number(row.attempts ?? 0) + 1;
  await current.DB.prepare(
    `UPDATE communications SET status = 'sending', attempts = ?, updated_at = ? WHERE id = ?`,
  )
    .bind(attempts, nowIso(), communicationId)
    .run();

  try {
    if (!current.SEND16_API_KEY)
      throw new Error("SEND16_API_KEY is not configured");
    const response = await fetch(
      "https://api.send16.com/api/transactional/api/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${current.SEND16_API_KEY}`,
          "Content-Type": "application/json",
          "Idempotency-Key": communicationId,
          "X-Send16-Source": "mackay-refrigeration-crm",
        },
        body: JSON.stringify({
          from: `${row.from_email ? current.SEND16_FROM_NAME || "Mackay Refrigeration" : "Mackay Refrigeration"} <${row.from_email}>`,
          to: row.to_email,
          subject: row.subject,
          html: row.html_body,
          text: row.text_body,
          reply_to: row.reply_to,
        }),
      },
    );
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        `Send16 ${response.status}: ${JSON.stringify(payload).slice(0, 500)}`,
      );
    }
    const responseData =
      typeof payload === "object" &&
      payload &&
      "data" in payload &&
      typeof payload.data === "object" &&
      payload.data
        ? payload.data
        : null;
    const providerId =
      responseData && "log_id" in responseData
        ? String(responseData.log_id)
        : typeof payload === "object" && payload && "log_id" in payload
          ? String(payload.log_id)
          : null;
    await current.DB.prepare(
      `UPDATE communications
       SET provider_id = ?, status = 'sent', sent_at = ?, updated_at = ?, last_error = NULL
       WHERE id = ?`,
    )
      .bind(providerId, nowIso(), nowIso(), communicationId)
      .run();
  } catch (error) {
    await current.DB.prepare(
      `UPDATE communications SET status = 'failed', last_error = ?, updated_at = ? WHERE id = ?`,
    )
      .bind(String(error).slice(0, 1000), nowIso(), communicationId)
      .run();
    throw error;
  }
}

export async function scheduleCommunication(
  communicationId: string,
  waitUntil?: ExecutionContext["waitUntil"],
): Promise<void> {
  const current = runtimeEnv();
  if (current.EMAIL_QUEUE) {
    try {
      await current.EMAIL_QUEUE.send(communicationId);
      return;
    } catch {
      // Fall through to the request-lifetime fallback if Queue is unavailable.
    }
  }
  const work = sendCommunication(communicationId).catch(() => undefined);
  if (waitUntil) waitUntil(work);
  else await work;
}

export function emailText(lines: string[]): string {
  return lines.filter(Boolean).join("\n\n");
}

export function emailHtml(lines: string[]): string {
  return `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#172433">${lines
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line).replaceAll("\n", "<br>")}</p>`)
    .join("")}</div>`;
}

export function asJson(value: unknown): string {
  return json(value);
}
