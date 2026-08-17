import { sendCommunication } from "../src/server/email";
import { nowIso, runtimeEnv } from "../src/server/db";

interface EmailMessage {
  body: string;
  ack(): void;
  retry(): void;
}

interface EmailBatch {
  messages: EmailMessage[];
}

export default {
  async queue(batch: EmailBatch) {
    for (const message of batch.messages) {
      try {
        await sendCommunication(message.body);
        message.ack();
      } catch {
        message.retry();
      }
    }
  },

  async scheduled(_controller: ScheduledController, _env: Env, context: ExecutionContext) {
    const current = runtimeEnv();
    const pending = await current.DB.prepare(
      `SELECT id FROM communications
       WHERE status IN ('queued', 'failed')
         AND attempts < 6
         AND updated_at < ?
       ORDER BY updated_at ASC LIMIT 25`,
    )
      .bind(new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .all<{ id: string }>();
    for (const row of pending.results) context.waitUntil(sendCommunication(row.id));
    await current.DB.prepare(`DELETE FROM login_tokens WHERE expires_at < ? OR used_at IS NOT NULL`)
      .bind(nowIso())
      .run();
    await current.DB.prepare(`DELETE FROM sessions WHERE expires_at < ? OR revoked_at IS NOT NULL`)
      .bind(nowIso())
      .run();
    await current.DB.prepare(`DELETE FROM rate_limits WHERE updated_at < ?`)
      .bind(new Date(Date.now() - 2 * 86400000).toISOString())
      .run();
  },
};
