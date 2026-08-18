import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import { unified } from "@astrojs/markdown-remark";
import sitemap from "@astrojs/sitemap";
import remarkReadingTime from "remark-reading-time";
import { domain, trailingSlash } from "./src/config/site";

export default defineConfig({
  output: "server",
  adapter: cloudflare({
    sessionKVBindingName: "SESSION",
    prerenderEnvironment: "workerd",
    remoteBindings: false,
  }),
  site: `https://${domain}`,
  trailingSlash: trailingSlash ? "always" : "never",
  // Preserve Astro 6's HTML-aware whitespace handling after the Astro 7 upgrade.
  compressHTML: true,
  integrations: [
    sitemap({
      filter: (page) => !new URL(page).pathname.startsWith("/crm"),
    }),
  ],
  security: {
    // src/middleware.ts performs the origin check with guarded browser-signal
    // and host-only SameSite cookie fallbacks for embedded browsers.
    checkOrigin: false,
    actionBodySizeLimit: 1024 * 1024,
  },
  markdown: {
    // Astro 7 defaults to Satteri. This project uses remark plugins, so keep the
    // supported unified processor until those plugins are ported.
    processor: unified({
      remarkPlugins: [
        remarkReadingTime,
        () => {
          return function (_tree, file) {
            file.data.astro.frontmatter.minutesRead =
              file.data.readingTime.minutes;
          };
        },
        // Convert standalone image paragraphs → <figure> + <figcaption>
        () => {
          return function (tree) {
            tree.children = tree.children.map((node) => {
              if (
                node.type === "paragraph" &&
                node.children.length === 1 &&
                node.children[0].type === "image"
              ) {
                const img = node.children[0];
                const escape = (s) =>
                  (s || "")
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;");
                const src = escape(img.url);
                const alt = escape(img.alt);
                const title = img.title ? ` title="${escape(img.title)}"` : "";
                const dimensions =
                  {
                    "/images/compressor.jpg": ' width="862" height="575"',
                  }[src] || "";
                const caption = alt ? `<figcaption>${alt}</figcaption>` : "";
                return {
                  type: "html",
                  value: `<figure class="post-figure"><img src="${src}" alt="${alt}"${title}${dimensions}>${caption}</figure>`,
                };
              }
              return node;
            });
          };
        },
      ],
    }),
  },
});
