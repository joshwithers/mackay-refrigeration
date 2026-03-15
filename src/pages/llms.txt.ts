import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { siteConfig, fullUrl } from "../config/site";

export const GET: APIRoute = async () => {
  const blog = await getCollection("blog");
  const reviews = await getCollection("reviews");

  const sortedBlog = blog.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
  const sortedReviews = reviews.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  const avgRating =
    sortedReviews.reduce((sum, r) => sum + r.data.rating, 0) /
    sortedReviews.length;

  const lines: string[] = [
    `# ${siteConfig.name}`,
    ``,
    `> ${siteConfig.description}`,
    ``,
    `## About`,
    ``,
    `Mackay Refrigeration Pty Ltd (ABN 32 107 715 766) is a commercial refrigeration`,
    `and air conditioning contractor based in Mackay, Queensland, Australia.`,
    `We service Mackay, Airlie Beach, Cannonvale, Bowen, and Moranbah.`,
    ``,
    `- Phone: 07 4953 1245 (24/7 emergency line)`,
    `- Email: service@mackayrefrig.com.au`,
    `- QBCC Licence: 15026021`,
    `- Arctick Licence: AU00021`,
    `- Hours: Mon–Thu 7:30am–4:30pm, Fri 7:30am–2:00pm`,
    ``,
    `We do NOT service domestic or residential customers.`,
    `All work is commercial and industrial only.`,
    ``,
    `## Services`,
    ``,
    `- Cold Rooms & Freezer Rooms: Custom-built cool rooms and freezer rooms for hospitality, retail, and primary producers. Temperatures from +10°C to −30°C.`,
    `- Commercial Refrigeration: Display cabinets, under-bench units, back-bar coolers, multi-deck cases, ice makers, refrigerant leak testing.`,
    `- Commercial Air Conditioning: Split systems, ceiling cassettes, ducted systems, multi-head, VRF/VRV. Commercial and industrial spaces only.`,
    `- Beer & Post Mix Systems: Reticulation design, installation, CO₂ and gas systems, glycol chillers, keg room refrigeration.`,
    `- Preventive Maintenance: Scheduled servicing contracts, refrigerant checks, coil cleaning, Arctick compliance certificates.`,
    `- Emergency Repairs: 24/7 response for compressor failures, refrigerant leaks, electrical faults across the service area.`,
    ``,
    `## Pages`,
    ``,
    `- [Home](${fullUrl('/')}): Main landing page with services overview`,
    `- [About](${fullUrl('/about')}): Company background, service area, licences`,
    `- [Services](${fullUrl('/services')}): Detailed breakdown of all six service categories`,
    `- [Contact](${fullUrl('/contact')}): Contact form, phone, email, business hours, service area`,
    `- [Reviews](${fullUrl('/reviews')}): Customer testimonials (${sortedReviews.length} reviews, avg ${avgRating.toFixed(1)}/5)`,
    `- [Blog](${fullUrl('/blog')}): Technical articles on commercial refrigeration`,
    `- [Privacy Policy](${fullUrl('/privacy')}): Privacy policy`,
    `- [Terms & Conditions](${fullUrl('/terms')}): Supply of equipment and services terms`,
    `- [Hire Contract](${fullUrl('/hire-contract')}): Equipment hire conditions and agreement form`,
    ``,
    `## Blog Posts`,
    ``,
    ...sortedBlog.map(
      (post) =>
        `- [${post.data.title}](${fullUrl(`/blog/${post.id}`)}): ${post.data.description}`
    ),
    ``,
    `## Customer Reviews`,
    ``,
    ...sortedReviews.map(
      (r) => `- ${r.data.name} (${r.data.address}): ${r.data.rating}/5 stars`
    ),
    ``,
    `## Machine-Readable Resources`,
    ``,
    `- [llms-full.txt](${fullUrl('/llms-full.txt')}): Full content version of this file with complete blog and review text`,
    `- [sitemap-index.xml](${fullUrl('/sitemap-index.xml')}): XML sitemap`,
    `- [rss.xml](${fullUrl('/rss.xml')}): RSS feed of blog posts`,
    `- [robots.txt](${fullUrl('/robots.txt')}): Robots directives`,
    `- [/ai](${fullUrl('/ai')}): Human-readable index of all bot and AI resources`,
    ``,
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
