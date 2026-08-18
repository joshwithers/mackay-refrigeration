import { defineMiddleware } from "astro:middleware";
import { getStaffBySession } from "./server/auth";
import {
  allowsMutationRequest,
  createCsrfCookieValue,
  CSRF_COOKIE_NAME,
  isValidCsrfCookieValue,
  pathNeedsCsrfCookie,
} from "./server/csrf";

export const onRequest = defineMiddleware(async (context, next) => {
  const requestUrl = new URL(context.request.url);
  const pathname = requestUrl.pathname;

  // Keep one canonical URL shape across the Worker, including old bookmarks
  // and links that still contain a trailing slash. Root remains `/`.
  if (pathname !== "/" && pathname.endsWith("/")) {
    requestUrl.pathname = pathname.replace(/\/+$/, "");
    return context.redirect(`${requestUrl.pathname}${requestUrl.search}`, 308);
  }

  const csrfCookie = context.cookies.get(CSRF_COOKIE_NAME)?.value;

  if (!allowsMutationRequest(context.request, csrfCookie)) {
    return new Response("Cross-site POST form submissions are forbidden", {
      status: 403,
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  if (
    context.request.method === "GET" &&
    pathNeedsCsrfCookie(pathname) &&
    !isValidCsrfCookieValue(csrfCookie)
  ) {
    context.cookies.set(CSRF_COOKIE_NAME, createCsrfCookieValue(), {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60,
    });
  }

  const session = context.cookies.get("crm_session")?.value;
  if (session) {
    try {
      const user = await getStaffBySession(session);
      if (user) context.locals.user = user;
    } catch {
      // A missing local/preview binding must not break the public website.
    }
  }

  const response = await next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()",
  );
  response.headers.set(
    "Referrer-Policy",
    pathname.startsWith("/crm") || pathname.startsWith("/forms/")
      ? "no-referrer"
      : "strict-origin-when-cross-origin",
  );
  if (
    pathname.startsWith("/crm") ||
    pathname.startsWith("/forms/") ||
    pathname.startsWith("/_actions/")
  ) {
    response.headers.set("Cache-Control", "private, no-store");
  }
  if (pathname.startsWith("/crm") || pathname.startsWith("/forms/")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    response.headers.set("Content-Security-Policy", "frame-ancestors 'none'");
  }
  return response;
});
