/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  SESSION: KVNamespace;
  EMAIL_QUEUE: Queue<string>;
  SEND16_API_KEY: string;
  SEND16_FROM_EMAIL?: string;
  SEND16_FROM_NAME?: string;
  SEND16_REPLY_TO?: string;
  STAFF_LOGIN_FROM_EMAIL?: string;
  STAFF_NOTIFICATION_EMAIL?: string;
  CRM_BASE_URL?: string;
  TURNSTILE_SECRET_KEY?: string;
  CRON_SECRET?: string;
}

declare namespace App {
  interface Locals {
    cfContext: ExecutionContext;
    user?: {
      id: string;
      name: string;
      email: string;
      role: "admin" | "staff" | "readonly";
    };
  }
}
