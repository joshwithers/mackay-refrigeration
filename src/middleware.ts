import { defineMiddleware } from "astro:middleware";
import { getStaffBySession } from "./server/auth";
import { allowsMutationRequest } from "./server/csrf";

export const onRequest = defineMiddleware(async (context, next) => {
  const requestUrl = new URL(context.request.url);
  const pathname = requestUrl.pathname;

  // Keep one canonical URL shape across the Worker, including old bookmarks
  // and links that still contain a trailing slash. Root remains `/`.
  if (pathname !== "/" && pathname.endsWith("/")) {
    requestUrl.pathname = pathname.replace(/\/+$/, "");
    return context.redirect(`${requestUrl.pathname}${requestUrl.search}`, 308);
  }

  if (!allowsMutationRequest(context.request)) {
    return new Response("Cross-site POST form submissions are forbidden", {
      status: 403,
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
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
