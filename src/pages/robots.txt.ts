import type { APIRoute } from "astro";
import { fullUrl } from "../config/site";

const robotsTxt = `
User-agent: *
Allow: /

Sitemap: ${fullUrl("/sitemap-index.xml")}

# LLM context files
# See https://llmstxt.org for specification
# Summary: ${fullUrl("/llms.txt")}
# Full content: ${fullUrl("/llms-full.txt")}
`.trim();

export const GET: APIRoute = () => {
  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
