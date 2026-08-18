const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export const CSRF_COOKIE_NAME = "__Host-mackay_csrf";

const CSRF_COOKIE_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function createCsrfCookieValue(): string {
  return crypto.randomUUID();
}

export function isValidCsrfCookieValue(value?: string): value is string {
  return Boolean(value && CSRF_COOKIE_PATTERN.test(value));
}

export function pathNeedsCsrfCookie(pathname: string): boolean {
  return (
    pathname === "/contact" ||
    pathname === "/hire-contract" ||
    pathname === "/service-supply" ||
    pathname.startsWith("/forms/") ||
    pathname === "/crm" ||
    pathname.startsWith("/crm/")
  );
}

function requestOrigin(request: Request): string {
  return new URL(request.url).origin;
}

function isSameOrigin(value: string, request: Request): boolean {
  try {
    return new URL(value).origin === requestOrigin(request);
  } catch {
    return false;
  }
}

/**
 * Protect state-changing routes from cross-site requests while supporting
 * embedded browsers that omit Origin on ordinary same-origin form posts.
 *
 * Origin is authoritative whenever it identifies a real origin. Without it,
 * Chromium's Sec-Fetch-Site signal, a same-origin Referer, or the host-only
 * SameSite=Strict marker issued with a protected page must be available.
 */
export function allowsMutationRequest(
  request: Request,
  csrfCookie?: string,
): boolean {
  if (SAFE_METHODS.has(request.method.toUpperCase())) return true;

  const origin = request.headers.get("Origin");
  if (origin && origin !== "null") return isSameOrigin(origin, request);

  if (!origin) {
    if (request.headers.get("Sec-Fetch-Site") === "same-origin") return true;

    const referer = request.headers.get("Referer");
    if (referer && isSameOrigin(referer, request)) return true;
  }

  return isValidCsrfCookieValue(csrfCookie);
}
