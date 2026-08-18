const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

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
 * Origin is authoritative whenever present. Without it, Chromium's
 * Sec-Fetch-Site signal must say same-origin, or a same-origin Referer must be
 * available. Requests with no browser provenance are rejected.
 */
export function allowsMutationRequest(request: Request): boolean {
  if (SAFE_METHODS.has(request.method.toUpperCase())) return true;

  const origin = request.headers.get("Origin");
  if (origin) return origin !== "null" && isSameOrigin(origin, request);

  if (request.headers.get("Sec-Fetch-Site") === "same-origin") return true;

  const referer = request.headers.get("Referer");
  return Boolean(referer && isSameOrigin(referer, request));
}
