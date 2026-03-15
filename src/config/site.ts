import ogImage from "../assets/images/og-image.png";

// ─── Site identity ────────────────────────────────────────────────────────────
// These two values drive the entire site. Change them here and everything
// (astro.config, canonical URLs, structured data, llms.txt, etc.) follows.
// ─────────────────────────────────────────────────────────────────────────────
export const domain = "mackay-refrigeration.pages.dev";
export const trailingSlash = true;

/**
 * Normalise an internal path according to the site's trailingSlash preference.
 * Leaves bare `/`, external URLs, tel:, mailto:, and hash links untouched.
 */
export function url(path: string): string {
  if (!path || path === '/' || /^(https?:|tel:|mailto:|#)/.test(path)) {
    return path;
  }
  const base = path.split(/[?#]/)[0];
  const suffix = path.slice(base.length);

  const isFilePath = /\/[^/]+\.[^/]+$/.test(base);

  if (isFilePath) {
    return (base.endsWith('/') ? base.slice(0, -1) : base) + suffix;
  }

  const normalized = trailingSlash
    ? (base.endsWith('/') ? base : base + '/')
    : (base.endsWith('/') ? base.slice(0, -1) : base);

  return normalized + suffix;
}

/**
 * Build a full absolute URL from an internal path.
 * e.g. fullUrl('/about') → 'https://mackayrefrigeration.com.au/about'
 */
export function fullUrl(path: string = '/'): string {
  return `https://${domain}${url(path)}`;
}

// Default theme: 'dark' or 'light' — used by all layouts when no user preference is stored
export const defaultTheme: "dark" | "light" = "dark";

// ─── Contact form ────────────────────────────────────────────────────────────
// Set to "netlify" to use Netlify Forms (no backend needed on Netlify hosting).
// Set to a URL (e.g. "https://formspree.io/f/xyzabc") to POST to a custom endpoint.
// ─────────────────────────────────────────────────────────────────────────────
export const formAction: "netlify" | string = "netlify";

export const siteConfig = {
  name: "Mackay Refrigeration & Air-Conditioning",
  description:
    "Commercial refrigeration and air conditioning for Mackay, Airlie Beach, Bowen, and Moranbah. Cool rooms, freezer systems, beer & post mix, and emergency repairs. QBCC licensed.",
  url: `https://${domain}`,
  lang: "en",
  locale: "en_AU",
  author: "Mackay Refrigeration Pty Ltd",
  twitter: "",
  ogImage: ogImage,
  navLinks: [
    { text: "Home", href: "/" },
    { text: "About", href: "/about" },
    { text: "Services", href: "/services" },
    { text: "Reviews", href: "/reviews" },
    { text: "Blog", href: "/blog" },
    { text: "Contact", href: "/contact" },
  ],
  socialLinks: {
    facebook: "https://www.facebook.com/mackayrefrigeration",
    twitter: "",
    github: "",
    discord: "",
  },
};
