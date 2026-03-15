import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import remarkReadingTime from "remark-reading-time";
import { domain, trailingSlash } from "./src/config/site";

export default defineConfig({
  site: `https://${domain}`,
  trailingSlash: trailingSlash ? "always" : "never",
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [
      remarkReadingTime,
      () => {
        return function (tree, file) {
          file.data.astro.frontmatter.minutesRead =
            file.data.readingTime.minutes;
        };
      },
      // Convert standalone image paragraphs → <figure> + <figcaption>
      () => {
        return function (tree) {
          tree.children = tree.children.map((node) => {
            if (
              node.type === 'paragraph' &&
              node.children.length === 1 &&
              node.children[0].type === 'image'
            ) {
              const img = node.children[0];
              const escape = (s) =>
                (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
              const src = escape(img.url);
              const alt = escape(img.alt);
              const title = img.title ? ` title="${escape(img.title)}"` : '';
              const caption = alt ? `<figcaption>${alt}</figcaption>` : '';
              return {
                type: 'html',
                value: `<figure class="post-figure"><img src="${src}" alt="${alt}"${title}>${caption}</figure>`,
              };
            }
            return node;
          });
        };
      },
    ],
  },
});
