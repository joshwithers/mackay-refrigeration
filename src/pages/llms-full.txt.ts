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
    `This is the full-content version of llms.txt. It includes complete blog post`,
    `and customer review content for comprehensive indexing.`,
    ``,
    `## About`,
    ``,
    `Mackay Refrigeration Pty Ltd (ABN 32 107 715 766) is a commercial refrigeration`,
    `and air conditioning contractor based in Mackay, Queensland, Australia.`,
    `We service Mackay, Airlie Beach, Cannonvale, Bowen, and Moranbah.`,
    ``,
    `- Phone: 07 4953 1245 (24/7 emergency line)`,
    `- Email: service@mackayrefrig.com.au`,
    `- Postal address: P.O. Box 4087, Mackay QLD 4740`,
    `- QBCC Licence: 15026021`,
    `- Arctick Licence: AU00021`,
    `- ABN: 32 107 715 766`,
    `- Hours: Mon–Thu 7:30am–4:30pm, Fri 7:30am–2:00pm, Sat–Sun Closed`,
    ``,
    `We do NOT service domestic or residential customers.`,
    `All work is commercial and industrial only.`,
    ``,
    `## Services`,
    ``,
    `### 01 — Cold Rooms & Freezer Rooms`,
    ``,
    `Custom-designed and built to suit your operation. Whether you need a small`,
    `coolroom for a café, a large walk-in freezer for a seafood processor, or a`,
    `purpose-built cool store for primary produce — we design, supply, install,`,
    `and commission the complete system. One contractor, start to finish.`,
    ``,
    `Specifications:`,
    `- Temperatures from +10°C to −30°C`,
    `- Custom dimensions and configurations`,
    `- Insulated panel floors, walls, and ceilings`,
    `- Glass door and solid door options`,
    `- Remote and on-site condensing units`,
    `- Blast chilling and quick-freeze systems`,
    `- Refrigerants: R448A, R449A, R134a, R290`,
    `- Temperature monitoring and alarms`,
    ``,
    `### 02 — Commercial Refrigeration`,
    ``,
    `Supply, installation, and ongoing maintenance of commercial refrigeration`,
    `equipment for hospitality, retail, food service, and industry. We work with`,
    `quality brands and specify the right unit for your application.`,
    ``,
    `Equipment types:`,
    `- Display cabinets and multi-deck cases`,
    `- Back-bar coolers and bottle displays`,
    `- Under-bench and undercounter refrigeration`,
    `- Island freezers and chest freezers`,
    `- Cellar and cool room systems`,
    `- Refrigerated prep tables`,
    `- Ice makers and ice storage`,
    `- Refrigerant top-up and leak testing`,
    ``,
    `### 03 — Commercial Air Conditioning`,
    ``,
    `Supply, installation, and maintenance of commercial air conditioning systems.`,
    `We size systems correctly for the space and usage — offices, retail,`,
    `hospitality, and industrial. All refrigerant work is handled by Arctick-licensed`,
    `technicians.`,
    ``,
    `System types:`,
    `- Wall-mounted split systems`,
    `- Ceiling cassette units`,
    `- Ducted commercial systems`,
    `- Multi-head and multi-split systems`,
    `- VRF/VRV systems`,
    `- Annual service agreements`,
    `- Filter cleaning and coil servicing`,
    ``,
    `### 04 — Beer & Post Mix Systems`,
    ``,
    `Complete reticulation system design, installation, and maintenance for licensed`,
    `venues. From keg room refrigeration to bar tap installation and post mix`,
    `calibration.`,
    ``,
    `Capabilities:`,
    `- Beer reticulation design and installation`,
    `- Python and line cleaning`,
    `- CO₂ and gas system installation`,
    `- Post mix installation and calibration`,
    `- Keg room refrigeration`,
    `- Glycol chiller systems`,
    `- Tap and font equipment`,
    `- Preventive maintenance contracts`,
    ``,
    `### 05 — Preventive Maintenance`,
    ``,
    `Scheduled servicing for refrigeration and air conditioning systems.`,
    `All refrigerant work is performed by Arctick-licensed technicians.`,
    `Full compliance documentation provided.`,
    ``,
    `Scope:`,
    `- Refrigerant level and pressure checks`,
    `- Coil and filter cleaning`,
    `- Electrical and safety inspections`,
    `- Arctick compliance certificates`,
    `- Temperature accuracy verification`,
    `- Door seal and gasket inspection`,
    `- Defrost cycle verification`,
    `- Written service reports`,
    ``,
    `### 06 — Emergency Repairs`,
    ``,
    `24/7 emergency response for compressor failures, refrigerant leaks,`,
    `electrical faults across Mackay, Airlie Beach, Bowen, and Moranbah.`,
    `Call 07 4953 1245.`,
    ``,
    `## Service Area`,
    ``,
    `- Mackay (all suburbs)`,
    `- Airlie Beach & Cannonvale`,
    `- Bowen`,
    `- Moranbah`,
    `- North Queensland (on request)`,
    ``,
    `## Licences & Registrations`,
    ``,
    `| Licence | Number |`,
    `|---|---|`,
    `| QBCC Contractor Licence | 15026021 |`,
    `| Arctick (refrigerant handling) | AU00021 |`,
    `| ABN | 32 107 715 766 |`,
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
    `- [For AI & Bots](${fullUrl('/ai')}): Machine-readable resources index`,
    ``,
    `---`,
    ``,
    `## Blog Posts (Full Content)`,
    ``,
  ];

  // Append full blog content
  for (const post of sortedBlog) {
    lines.push(`### ${post.data.title}`);
    lines.push(``);
    lines.push(`Published: ${post.data.pubDate.toISOString().split("T")[0]}`);
    lines.push(`URL: ${fullUrl(`/blog/${post.id}`)}`);
    lines.push(`Description: ${post.data.description}`);
    if (post.data.youtube) {
      lines.push(`Video: https://www.youtube.com/watch?v=${post.data.youtube}`);
    }
    lines.push(``);
    if (post.body) {
      // Strip image markdown references (local asset paths aren't useful in plain text)
      const cleanBody = post.body
        .replace(/!\[([^\]]*)\]\([^)]+\)\n*/g, (_, alt) =>
          alt ? `[Image: ${alt}]\n` : ""
        )
        .trim();
      lines.push(cleanBody);
    }
    lines.push(``);
    lines.push(`---`);
    lines.push(``);
  }

  // Append full review content
  lines.push(`## Customer Reviews (Full Content)`);
  lines.push(``);

  for (const review of sortedReviews) {
    lines.push(`### ${review.data.name}`);
    lines.push(``);
    lines.push(`Location: ${review.data.address}`);
    lines.push(`Rating: ${review.data.rating}/5 stars`);
    lines.push(``);
    if (review.body) {
      lines.push(review.body.trim());
    }
    lines.push(``);
    lines.push(`---`);
    lines.push(``);
  }

  // Structured data summary
  lines.push(`## Structured Data (Schema.org)`);
  lines.push(``);
  lines.push(`This website includes a LocalBusiness schema (JSON-LD) on every page with:`);
  lines.push(`- Business name, address, phone, email`);
  lines.push(`- Opening hours`);
  lines.push(`- Service area (Mackay, Airlie Beach, Bowen, Moranbah)`);
  lines.push(`- ABN identifier`);
  lines.push(``);
  lines.push(`## Machine-Readable Resources`);
  lines.push(``);
  lines.push(`- [llms.txt](${fullUrl('/llms.txt')}): Summary version of this file`);
  lines.push(`- [sitemap-index.xml](${fullUrl('/sitemap-index.xml')}): XML sitemap`);
  lines.push(`- [rss.xml](${fullUrl('/rss.xml')}): RSS feed of blog posts`);
  lines.push(`- [robots.txt](${fullUrl('/robots.txt')}): Robots directives`);
  lines.push(`- [/ai](${fullUrl('/ai')}): Human-readable index of all bot and AI resources`);
  lines.push(``);

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
