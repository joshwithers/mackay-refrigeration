const baseUrl = (
  process.env.SMOKE_BASE_URL ||
  "https://mackay-refrigeration.withersco.workers.dev"
).replace(/\/$/, "");
const failures = [];
const internalLinks = new Set();

function check(condition, message) {
  if (!condition) failures.push(message);
}

async function request(path, options = {}) {
  return fetch(`${baseUrl}${path}`, {
    redirect: options.redirect || "follow",
    headers: { "User-Agent": "Mackay-Refrigeration-Smoke-Test/1.0" },
  });
}

async function expectPage(path, marker) {
  const response = await request(path);
  const body = await response.text();
  check(response.status === 200, `${path} returned ${response.status}`);
  check(
    body.includes(marker),
    `${path} did not contain ${JSON.stringify(marker)}`,
  );
  check(
    !body.includes("404 — Thermal Overload"),
    `${path} rendered the custom 404 page`,
  );
  collectInternalLinks(body);
  return { response, body };
}

function collectInternalLinks(body) {
  for (const match of body.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)) {
    const href = match[1];
    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    ) {
      continue;
    }
    const target = new URL(href, baseUrl);
    if (target.origin !== new URL(baseUrl).origin) continue;
    check(
      target.pathname === "/" || !target.pathname.endsWith("/"),
      `internal link has a trailing slash: ${href}`,
    );
    internalLinks.add(`${target.pathname}${target.search}`);
  }
}

await expectPage("/", "Mackay Refrigeration");
const contact = await expectPage("/contact", "Send us a message");
check(contact.body.includes("<form"), "/contact did not render a form");

const login = await expectPage("/crm/login", "Sign in to the");
check(
  login.response.headers.get("cache-control")?.includes("no-store"),
  "/crm/login is missing no-store caching",
);
check(
  login.response.headers.get("x-robots-tag")?.includes("noindex"),
  "/crm/login is missing X-Robots-Tag noindex",
);
check(
  login.body.includes('name="robots" content="noindex'),
  "/crm/login is missing the robots noindex meta tag",
);
check(
  login.response.headers.get("x-frame-options") === "DENY",
  "/crm/login is missing clickjacking protection",
);
check(
  login.response.headers.get("x-content-type-options") === "nosniff",
  "/crm/login is missing MIME-sniffing protection",
);
check(
  login.response.headers.get("referrer-policy") === "no-referrer",
  "/crm/login is missing its private-page referrer policy",
);
check(
  login.response.headers
    .get("content-security-policy")
    ?.includes("frame-ancestors 'none'"),
  "/crm/login is missing CSP frame protection",
);
check(
  !login.body.includes("analytics.ahrefs.com"),
  "/crm/login loads public-site analytics",
);

for (const [from, to] of [
  ["/contact/", "/contact"],
  ["/crm/login/", "/crm/login"],
]) {
  const response = await request(from, { redirect: "manual" });
  check(
    [301, 302, 307, 308].includes(response.status),
    `${from} did not redirect`,
  );
  check(
    response.headers.get("location") === to,
    `${from} redirected to ${response.headers.get("location")} instead of ${to}`,
  );
}

for (const privatePath of ["/crm", "/crm/forms", "/crm/contacts"]) {
  const response = await request(privatePath, { redirect: "manual" });
  check(
    [301, 302, 303, 307, 308].includes(response.status),
    `${privatePath} returned ${response.status} instead of redirecting`,
  );
  check(
    response.headers.get("location") === "/crm/login",
    `${privatePath} redirected to ${response.headers.get("location")} instead of /crm/login`,
  );
}

const secureForm = await expectPage(
  "/forms/service-supply",
  "This form link is unavailable",
);
check(
  secureForm.response.headers.get("cache-control")?.includes("no-store"),
  "/forms/service-supply is missing no-store caching",
);
check(
  secureForm.response.headers.get("x-robots-tag")?.includes("noindex"),
  "/forms/service-supply is missing X-Robots-Tag noindex",
);
check(
  secureForm.response.headers.get("referrer-policy") === "no-referrer",
  "/forms/service-supply is missing its private-page referrer policy",
);
check(
  !secureForm.body.includes("analytics.ahrefs.com"),
  "/forms/service-supply loads public-site analytics",
);

const missing = await request("/this-route-must-not-exist");
const missingBody = await missing.text();
check(
  missing.status === 404,
  `unknown route returned ${missing.status} instead of 404`,
);
check(
  missingBody.includes("404 — Thermal Overload"),
  "unknown route did not render the custom 404 page",
);

const sitemapIndex = await request("/sitemap-index.xml");
const sitemapIndexBody = await sitemapIndex.text();
check(
  sitemapIndex.status === 200,
  `/sitemap-index.xml returned ${sitemapIndex.status}`,
);
const sitemapLocations = [
  ...sitemapIndexBody.matchAll(/<loc>([^<]+)<\/loc>/g),
].map((match) => match[1]);
check(sitemapLocations.length > 0, "sitemap index contains no sitemap URLs");

for (const sitemapLocation of sitemapLocations) {
  const sitemapUrl = new URL(new URL(sitemapLocation).pathname, baseUrl);
  const response = await fetch(sitemapUrl);
  const body = await response.text();
  check(
    response.status === 200,
    `${sitemapLocation} returned ${response.status}`,
  );
  const pageLocations = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => match[1],
  );
  check(
    !pageLocations.some((url) => new URL(url).pathname.startsWith("/crm")),
    `${sitemapLocation} exposes CRM routes`,
  );
  check(
    !pageLocations.some(
      (url) =>
        new URL(url).pathname !== "/" && new URL(url).pathname.endsWith("/"),
    ),
    `${sitemapLocation} contains trailing-slash URLs`,
  );
  for (const pageUrl of pageLocations) {
    const localPageUrl = new URL(
      `${new URL(pageUrl).pathname}${new URL(pageUrl).search}`,
      baseUrl,
    );
    const pageResponse = await fetch(localPageUrl, {
      headers: { "User-Agent": "Mackay-Refrigeration-Smoke-Test/1.0" },
    });
    const pageBody = await pageResponse.text();
    check(
      pageResponse.status === 200,
      `${pageUrl} returned ${pageResponse.status}`,
    );
    check(
      !pageBody.includes("404 — Thermal Overload"),
      `${pageUrl} rendered the custom 404 page`,
    );
    collectInternalLinks(pageBody);
  }
}

for (const internalLink of internalLinks) {
  const response = await request(internalLink);
  const body = await response.text();
  check(
    response.status < 400,
    `internal link ${internalLink} returned ${response.status}`,
  );
  check(
    !body.includes("404 — Thermal Overload"),
    `internal link ${internalLink} rendered the custom 404 page`,
  );
}

if (failures.length) {
  console.error(
    `Smoke test failed with ${failures.length} problem${failures.length === 1 ? "" : "s"}:`,
  );
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Smoke test passed for ${baseUrl}`);
}
