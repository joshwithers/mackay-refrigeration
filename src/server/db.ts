import { env } from "cloudflare:workers";

export function runtimeEnv(): Env {
  return env as unknown as Env;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function id(): string {
  return crypto.randomUUID();
}

export function normaliseEmail(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

export function normalisePhone(value: unknown): string {
  return String(value ?? "").replace(/[^0-9+]/g, "").replace(/^\+61/, "0");
}

export async function hashSecret(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function randomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function json(value: unknown): string {
  return JSON.stringify(value ?? null);
}

export async function hashIp(request: Request): Promise<string | null> {
  const ip = request.headers.get("CF-Connecting-IP");
  return ip ? hashSecret(ip) : null;
}

export function publicBaseUrl(request: Request): string {
  return runtimeEnv().CRM_BASE_URL || new URL(request.url).origin;
}
