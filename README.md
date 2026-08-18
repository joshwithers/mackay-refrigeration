# Mackay Refrigeration & Air-Conditioning Website

Business website for **Mackay Refrigeration Pty Ltd**, built with Astro 7 by [Josh Withers](https://joshwithers.au) at [The Internet](https://theinternet.com.au). No frameworks like React or Vue — just Astro components, CSS, and vanilla JavaScript.

**Worker URL:** [mackay-refrigeration.withersco.workers.dev](https://mackay-refrigeration.withersco.workers.dev)

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Getting Started](#getting-started)
3. [Available Commands](#available-commands)
4. [Project Structure](#project-structure)
5. [Pages](#pages)
6. [Components](#components)
7. [Layouts](#layouts)
8. [Styling](#styling)
9. [Content Collections (Blog & Reviews)](#content-collections-blog--reviews)
10. [Configuration](#configuration)
11. [CRM Forms & Email](#crm-forms--email)
12. [Building for Production](#building-for-production)
13. [Deployment](#deployment)
14. [How-To Guides](#how-to-guides)
15. [Troubleshooting](#troubleshooting)

---

## Prerequisites

You need two things installed on your computer:

- **Node.js** 24.16 or later in the Node 24 release line (see `.nvmrc`) — [download here](https://nodejs.org)
- **npm** (comes bundled with Node.js)

To check if you already have them, open a terminal and run:

```bash
node -v
npm -v
```

Both should print a version number. If not, install Node.js from the link above.

---

## Getting Started

1. **Clone the repo** (or download and unzip it):

   ```bash
   git clone <repo-url>
   cd fridge-001
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

   This downloads all the packages the project needs into a `node_modules/` folder. You only need to do this once (or after pulling new changes that update `package.json`).

3. **Start the dev server:**

   ```bash
   npm run dev
   ```

   This opens a local server at `http://localhost:4321`. Any file you save will instantly refresh in the browser.

4. **Stop the server** by pressing `Ctrl + C` in the terminal.

---

## Available Commands

Run these from the project root folder:

| Command                | What it does                                                      |
| ---------------------- | ----------------------------------------------------------------- |
| `npm run dev`          | Start local dev server with hot reload                            |
| `npm run build`        | Build the production site into the `dist/` folder                 |
| `npm run preview`      | Preview the production build locally (run `build` first)          |
| `npm run build-preview`| Build then preview in one step                                    |
| `npm run format`       | Auto-format all files with Prettier                               |
| `npm run lint`         | Lint and auto-fix with ESLint                                     |
| `npm run fix`          | Format + lint in one step                                         |
| `npm run check`        | Run Astro's built-in diagnostics (catches type and syntax errors) |
| `npm run typecheck`    | Run TypeScript checks without emitting files                    |
| `npm run lint:check`   | Check ESLint rules without changing files                       |
| `npm run db:migrate:local` | Apply D1 migrations to the local Wrangler database          |
| `npm run db:migrate:remote` | Apply D1 migrations to the configured Cloudflare database |
| `npm run db:demo:local` | Load the fictional celebrity demonstration records locally |
| `npm run db:demo:remove:local` | Remove all locally seeded demonstration records |
| `npm run deploy`       | Build and deploy the site Worker and email queue Worker         |

---

## Project Structure

```
fridge-001/
├── public/                   # Static files copied as-is to the build
│   ├── favicons/             # Favicon files
│   └── images/               # Images that don't need processing
│
├── src/
│   ├── assets/images/        # Images that Astro optimises at build time
│   │
│   ├── components/           # Reusable UI pieces (see Components section)
│   │   ├── Nav.astro
│   │   ├── Hero.astro
│   │   ├── Stats.astro
│   │   ├── ServicesGrid.astro
│   │   ├── ServiceCard.astro
│   │   ├── PageHero.astro
│   │   ├── CTA.astro
│   │   ├── Footer.astro
│   │   ├── TempGauge.astro
│   │   ├── ReviewCard.astro
│   │   ├── blog/PostItem.astro
│   │   └── seo/
│   │       ├── Seo.astro
│   │       └── Schema.astro
│   │
│   ├── config/
│   │   ├── site.ts           # Domain, site name, nav links, social links
│   │   └── navigation.ts     # Full nav menu structure (used by Nav.astro)
│   │
│   ├── content/              # Markdown content collections
│   │   ├── blog/             # Blog posts (Markdown files)
│   │   └── reviews/          # Customer reviews (Markdown files)
│   ├── content/forms/        # Markdown-driven CRM form definitions
│   ├── actions/              # Astro Actions for forms, auth and CRM staff work
│   ├── server/               # D1, magic-link auth and Send16 email services
│   ├── lib/forms.ts          # Shared form-definition helpers
│   ├── middleware.ts         # CRM session lookup
│   │
│   ├── layouts/
│   │   ├── Base.astro        # Main layout (all pages use this)
│   │   └── PostLayout.astro  # Blog post layout (extends Base concepts)
│   │
│   ├── pages/                # Each file = a URL on the site
│   │   ├── index.astro       # Homepage          → /
│   │   ├── about.astro       # About page        → /about/
│   │   ├── services.astro    # Services page     → /services/
│   │   ├── contact.astro     # Contact page      → /contact/
│   │   ├── service-supply.astro # Service form entry → /service-supply/
│   │   ├── reviews.astro     # Reviews page      → /reviews/
│   │   ├── privacy.astro     # Privacy policy    → /privacy/
│   │   ├── terms.astro       # Terms             → /terms/
│   │   ├── hire-contract.astro # Hire contract   → /hire-contract/
│   │   ├── forms/[slug].astro # Tokenised customer forms
│   │   ├── crm/               # Staff CRM dashboard and contacts
│   │   ├── ai.astro          # AI/bots info      → /ai/
│   │   ├── 404.astro         # Not-found page
│   │   ├── robots.txt.ts     # Auto-generated robots.txt
│   │   ├── rss.xml.js        # RSS feed          → /rss.xml
│   │   ├── llms.txt.ts       # LLM-readable summary
│   │   ├── llms-full.txt.ts  # Full LLM-readable content
│   │   └── blog/
│   │       ├── [...page].astro  # Paginated blog list → /blog/
│   │       └── [...slug].astro  # Individual posts    → /blog/post-name/
│   │
│   ├── styles/
│   │   ├── refrigeration.css # All custom styles, CSS variables, animations
│   │   └── global.css        # Loads the main stylesheet and focus styles
│   │
│   ├── types/
│   │   └── types.d.ts        # TypeScript type definitions
│   │
│   └── content.config.ts     # Defines blog & review collection schemas
│
├── _trash/                   # Unused legacy files (not deployed, git-ignored)
├── astro.config.mjs          # Astro build configuration
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript settings
├── eslint.config.js          # Linting rules
├── .prettierrc               # Code formatting rules
└── .gitignore                # Files excluded from git
```

---

## Pages

Every `.astro` file in `src/pages/` becomes a page on the site. The filename determines the URL.

| File                        | URL                  | Description                           |
| --------------------------- | -------------------- | ------------------------------------- |
| `index.astro`               | `/`                  | Homepage with hero, stats, services   |
| `about.astro`               | `/about`             | About the company                     |
| `services.astro`            | `/services`          | Full services breakdown (6 sections)  |
| `contact.astro`             | `/contact`           | Contact form + business details       |
| `reviews.astro`             | `/reviews`           | Customer reviews from collection      |
| `privacy.astro`             | `/privacy`           | Privacy policy                        |
| `terms.astro`               | `/terms`             | Terms and conditions                  |
| `hire-contract.astro`       | `/hire-contract`     | Equipment hire contract               |
| `ai.astro`                  | `/ai`                | Information page for AI crawlers      |
| `404.astro`                 | (error page)         | Shown when a page is not found        |
| `blog/[...page].astro`      | `/blog`              | Paginated blog listing                |
| `blog/[...slug].astro`      | `/blog/post-name`    | Individual blog post                  |

---

## Components

Components are reusable building blocks. They live in `src/components/` and are imported into pages and layouts.

| Component              | What it does                                                    |
| ---------------------- | --------------------------------------------------------------- |
| **Nav.astro**          | Fixed top navigation bar with mobile hamburger menu and theme toggle (dark/light mode) |
| **Hero.astro**         | Homepage hero section with animated SVG illustrations           |
| **Stats.astro**        | Business statistics section (years in business, etc.)           |
| **ServicesGrid.astro** | Grid of 6 service cards on the homepage                         |
| **ServiceCard.astro**  | Individual service card (used inside ServicesGrid)              |
| **PageHero.astro**     | Compact hero banner for interior pages (services, contact)      |
| **CTA.astro**          | Call-to-action section ("Get a free quote")                     |
| **Footer.astro**       | Site footer with contact info, links, and licence numbers       |
| **TempGauge.astro**    | Animated temperature gauge that reacts to scrolling             |
| **ReviewCard.astro**   | Individual customer review card with star rating                |
| **blog/PostItem.astro**| Blog post preview card for the blog listing page                |
| **seo/Seo.astro**      | Injects meta tags, Open Graph, and Twitter card data            |
| **seo/Schema.astro**   | Injects schema.org structured data (JSON-LD)                   |

---

## Layouts

Layouts wrap page content with shared structure (HTML head, nav, scripts, background effects).

- **Base.astro** — The main layout used by almost every page. Includes the `<head>`, navigation, temperature gauge, background grid/vapour effects, and all interactive JavaScript (scroll reveals, counter animations, gauge interactions).
- **PostLayout.astro** — Used by individual blog posts. Adds post header (title, date, reading time), hero image, optional YouTube embed, and the post body.

---

## Styling

The site uses a custom dark "blueprint" design. All styles live in two files:

### `src/styles/refrigeration.css`

This is the main stylesheet. It contains:

- **CSS custom properties** (variables) for all colours, spacing, and effects
- **Component styles** — every component's CSS is defined here
- **Animations** — reveal effects, vapour, gauge, SVG draw-on
- **Light/dark theme variables**

Key colour variables (defined in `:root`):

| Variable           | Purpose                    | Dark value   |
| ------------------ | -------------------------- | ------------ |
| `--bg-deep`        | Page background            | `#0a0e17`    |
| `--frost`          | Accent/highlight colour    | `#7ec8e3`    |
| `--text-primary`   | Main text colour           | `#e0e8f0`    |
| `--text-secondary` | Subdued text               | `#8899aa`    |
| `--card-bg`        | Card backgrounds           | `#0d1321`    |

To change the colour scheme, edit these variables in `refrigeration.css`.

### `src/styles/global.css`

Imports `refrigeration.css` and defines the shared keyboard focus treatment. You rarely need to edit this file.

### Theme (dark/light mode)

- **Dark mode is the default.** The site loads in dark mode unless the user has previously chosen light mode.
- The theme toggle button is in the navigation bar (`Nav.astro`).
- Theme preference is saved in `localStorage` and persists across visits.
- Theme variables are defined in `refrigeration.css` under `:root` (dark) and `:root[data-theme="light"]` (light).

---

## Content Collections (Blog & Reviews)

The site has two content collections defined in `src/content.config.ts`. Collections let you add content by creating Markdown files — no code changes needed.

### Adding a Blog Post

1. Create a new `.md` file in `src/content/blog/`:

   ```
   src/content/blog/my-new-post.md
   ```

2. Add this frontmatter at the top of the file:

   ```markdown
   ---
   title: "Your Post Title"
   pubDate: "2026-03-15"
   description: "A short summary of the post (used in previews and SEO)."
   image: "../../assets/images/blog/your-image.jpg"
   youtube: dQw4w9WgXcQ
   ---

   Your post content goes here. Use normal Markdown formatting.

   ## Subheadings work

   - Bullet lists work
   - **Bold** and *italic* work
   ```

   | Field         | Required? | Description                                            |
   | ------------- | --------- | ------------------------------------------------------ |
   | `title`       | Yes       | Post title                                             |
   | `pubDate`     | Yes       | Publication date (`YYYY-MM-DD` format)                 |
   | `description` | Yes       | Short summary for previews and SEO meta tags           |
   | `image`       | No        | Path to a hero image (relative to the file)            |
   | `youtube`     | No        | YouTube video ID (just the ID, not the full URL)       |

3. If you have an image, place it in `src/assets/images/blog/` and reference it with the relative path shown above.

4. Save the file. The post will automatically appear on the blog page.

### Adding a Customer Review

1. Create a new `.md` file in `src/content/reviews/`:

   ```
   src/content/reviews/business-name.md
   ```

2. Add this frontmatter:

   ```markdown
   ---
   name: "Business Name"
   address: "Suburb, QLD"
   rating: 5
   pubDate: "2026-03-15"
   ---

   The review text goes here. Write it as plain text or Markdown.
   ```

   | Field     | Required? | Description                            |
   | --------- | --------- | -------------------------------------- |
   | `name`    | Yes       | Customer or business name              |
   | `address` | Yes       | Location                               |
   | `rating`  | Yes       | Star rating, 1 to 5                    |
   | `pubDate` | Yes       | Date (`YYYY-MM-DD` format)             |
   | `website` | No        | Customer's website URL                 |
   | `photo`   | No        | Path to a photo                        |

3. Save the file. The review will automatically appear on the reviews page.

---

## Configuration

### Site settings — `src/config/site.ts`

This file controls the site's identity. Key values:

```typescript
export const domain = "mackayrefrigeration.com.au";  // Your domain
export const trailingSlash = true;                     // URLs end with /
export const defaultTheme = "dark";                    // Default colour theme
```

The `siteConfig` object in the same file controls:
- `name` — Site title (appears in browser tab and SEO)
- `description` — Default meta description for SEO
- `navLinks` — Links shown in the main navigation
- `socialLinks` — Social media URLs (used in footer)
- `ogImage` — Default Open Graph image for social sharing

### Navigation — `src/config/navigation.ts`

The full navigation menu structure used by the hamburger/slide-out menu. Organised into groups (Company, Legal). Edit this file to add or remove navigation links from the menu panel.

### Astro config — `astro.config.mjs`

Build-level settings. You usually only need to touch this if changing the domain (which is imported from `site.ts` anyway). Includes:
- Sitemap generation
- Astro 7's unified Markdown processor for reading time and image-to-figure plugins

---

## CRM Forms & Email

All customer forms submit to the Cloudflare Worker through Astro Actions and are recorded in D1:

- `/contact` creates a website enquiry and notifies staff.
- `/service-supply` and `/forms/service-supply` are invitation-backed service forms.
- `/hire-contract` and `/forms/hire-contract` are invitation-backed hire agreements. The submitted Markdown version, acceptance values and timestamp are retained with the record.
- Staff use `/crm` to add phone enquiries, find contacts, update enquiry status, add notes and send either form as a magic-link invitation.
- `/crm/forms` is the operational forms and contracts queue. It separates service supply forms from hire contracts, shows forms still waiting on customers, flags new submissions for review and tracks type-specific lifecycle states and due dates.
- `/crm/forms/submissions/:id` displays the immutable submitted answers and lets staff move a service form through review and scheduling, or a hire contract through approval, active hire, return-due and completion stages.

The three form definitions live in `src/content/forms/*.md`. Content staff can edit labels, options, required fields and explanatory copy in Markdown. The version in frontmatter is stored with every submission so later edits do not rewrite historical records.

Email is sent by the separate `mackay-refrigeration-email` queue Worker using [Send16](https://send16.com). The site Worker queues notification records in D1 and Cloudflare Queues; the email Worker retries failures and records provider IDs/statuses. Staff recipients are configured in the CRM's `notification_rules` table, with `STAFF_NOTIFICATION_EMAIL` as the fallback.

The CRM uses passwordless magic links. A staff member submits their email at `/crm/login`, receives a 15-minute single-use link, and gets a seven-day session cookie after verification. Only active `staff_users` rows can request a link.

---

## Building for Production

```bash
npm run build
```

This generates the Cloudflare Worker bundle in `dist/server/` and the static asset bundle in `dist/client/`. Public content remains prerendered for speed, while forms and CRM routes execute at the edge.

---

## Deployment

Deployment is Cloudflare Workers rather than Pages. The Workers are deployed in the Withers Cloudflare account. The resource IDs are committed in the Wrangler configs so subsequent deployments are repeatable:

1. If deploying to a different Cloudflare account, create the production/preview D1 databases, production/preview KV namespaces, and the two queues, then replace the IDs in [`wrangler.jsonc`](./wrangler.jsonc) and [`wrangler.email.jsonc`](./wrangler.email.jsonc).
2. Set the production domain in `src/config/site.ts` and `CRM_BASE_URL` to that canonical origin.
3. Apply the schema: `npm run db:migrate:remote`.
4. Add an initial active admin row to `staff_users` through `wrangler d1 execute` (do not commit a real staff email to source control), for example:
   ```bash
   npx wrangler d1 execute mackay-refrigeration-crm --remote --command "INSERT INTO staff_users (id,email,name,role,active,created_at,updated_at) VALUES ('admin-1','you@example.com','Your name','admin',1,datetime('now'),datetime('now'));"
   ```
5. Configure secrets on both Workers. The email Worker needs `SEND16_API_KEY`, `SEND16_FROM_EMAIL`, `SEND16_FROM_NAME`, `SEND16_REPLY_TO`, `STAFF_LOGIN_FROM_EMAIL`, and `STAFF_NOTIFICATION_EMAIL`; the site Worker needs the Send16 values as a fallback if queue delivery is unavailable, plus `CRM_BASE_URL` and optionally `TURNSTILE_SECRET_KEY`.
6. Deploy with `npm run deploy`. The script removes preview-only bindings from Astro's generated production config, deploys the site Worker, and then deploys `wrangler.email.jsonc` with `workers/email-consumer.ts`.

For local development, copy `.dev.vars.example` to `.dev.vars`, apply `npm run db:migrate:local`, seed a demo staff user, and run `npm run dev`. Local Queue messages stay queued unless an email Worker is run separately; the local form/database flow can still be exercised end to end.

For a client demonstration, `npm run db:demo:local` loads four clearly marked fictional records using celebrity names and non-deliverable `.invalid` email addresses. It is safe to rerun and replaces only records whose IDs start with `demo-`. Sending a form from one of these records creates the on-screen invitation state but deliberately sends no email. Remove the complete demo dataset with `npm run db:demo:remove:local`.

### Important deployment settings
- **Canonical domain:** `src/config/site.ts` (`domain`) and `CRM_BASE_URL`
- **Trailing slashes:** Disabled — canonical page URLs omit the trailing `/`
- **Sitemap:** Auto-generated at `/sitemap-index.xml`
- **RSS feed:** Available at `/rss.xml`
- **Form editing:** Markdown in `src/content/forms/`
- **Retention:** review D1 access and retention for sensitive fields such as driver's licence numbers before production use

---

## How-To Guides

### Change text on a page

Open the corresponding file in `src/pages/`. Astro files look like HTML — the text between tags is what shows on the site. Edit, save, and the dev server refreshes automatically.

### Change a reusable section (nav, footer, etc.)

Open the component in `src/components/`. For example, to update the phone number in the footer, edit `Footer.astro`. Search for the current value and replace it.

### Add a new page

1. Create a new `.astro` file in `src/pages/`. The filename becomes the URL:

   ```
   src/pages/warranty.astro  →  /warranty/
   ```

2. Copy an existing page (like `about.astro`) as a starting template.

3. Every page should start with this structure:

   ```astro
   ---
   import Base from "../layouts/Base.astro";
   import Footer from "../components/Footer.astro";
   // Import any other components you need
   ---

   <Base title="Page Title" description="Page description for SEO.">
     <!-- Your page content here -->
     <Footer />
   </Base>
   ```

4. Add a link to the new page in `src/config/site.ts` (navLinks) and/or `src/config/navigation.ts`.

### Change colours

Edit the CSS variables at the top of `src/styles/refrigeration.css`. The `:root` block has all colour definitions. Change the values there and they'll apply site-wide.

### Update business info (phone, email, address)

Business details appear in several components. Search the entire `src/` folder for the current value (e.g., search for `07 4953 1245`) and update every occurrence. Key places:
- `src/components/Footer.astro`
- `src/components/CTA.astro`
- `src/pages/contact.astro`
- `src/layouts/Base.astro` (schema.org structured data)

### Add or remove a service

1. **Homepage cards:** Edit `src/components/ServicesGrid.astro`
2. **Services page sections:** Edit `src/pages/services.astro`

### Change the site's domain

1. Update `domain` in `src/config/site.ts`
2. Rebuild (`npm run build`) — the sitemap, canonical URLs, and structured data will all update automatically

---

## Troubleshooting

| Problem                          | Fix                                                             |
| -------------------------------- | --------------------------------------------------------------- |
| `npm run dev` won't start        | Delete `node_modules/` and run `npm install` again              |
| Styles look wrong after changes  | Hard-refresh the browser (`Cmd+Shift+R` / `Ctrl+Shift+R`)      |
| Build fails with type errors     | Run `npm run check` to see specific issues                      |
| Port 4321 already in use         | Stop other dev servers, or use `npm run dev -- --port 3000`     |
| Changes not showing up           | Make sure the dev server is running (`npm run dev`)             |
| New blog post not appearing      | Check the frontmatter format matches the example exactly        |
| Form not submitting              | Check the Worker logs, D1 binding, and `npm run db:migrate:remote` |
| Staff magic link not arriving    | Check Send16 secrets, `STAFF_LOGIN_FROM_EMAIL`, and the email Worker queue |
| Invite link says invalid         | Confirm the token has not expired/revoked and that the D1 binding is shared by both Workers |

---

## Technical Notes

These details are useful if you need to do deeper development work:

- All `<script>` tags use Astro's `is:inline` directive — this prevents Astro from bundling them and ensures correct timing with Intersection Observers and DOM-dependent code.
- SVG paths in `Hero.astro` are hand-tuned for draw-on animations — avoid editing them unless you know what you're doing.
- The `.reveal` class triggers scroll-based fade-in animations. Elements start hidden and gain the `.visible` class when scrolled into view (JavaScript in `Base.astro`).
- The `_trash/` folder contains unused legacy components from an earlier design system. They are git-ignored and not deployed. You can safely delete the folder if you don't need them for reference.
