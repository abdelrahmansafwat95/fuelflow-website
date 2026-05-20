# FuelFlow — Marketing Website

The public-facing marketing site for FuelFlow, the cashless fuel-management platform for Egyptian corporate fleets.

Built as a static, multi-page site — semantic HTML, one shared CSS file, a small vanilla JS bundle, and full Arabic (RTL) mirrors of every page. No build step required, deployable to any static host (S3 + CloudFront, Vercel static, Cloudflare Pages, Nginx, etc.).

## Structure

```
.
├── index.html                    Home
├── for-fleets.html               Fleet operators / finance
├── for-stations.html             Stations & operators
├── drivers.html                  Driver app landing
├── how-it-works.html             End-to-end transaction flow
├── security.html                 Trust & compliance
├── pricing.html                  Plans
├── about.html                    Company / mission
├── contact.html                  Sales form + WhatsApp + phone
├── 404.html                      Error page
├── sitemap.xml                   With hreflang en/ar pairs
├── robots.txt
├── legal/
│   ├── privacy.html
│   └── terms.html
├── ar/                           Full Arabic RTL mirror
│   ├── index.html
│   ├── for-fleets.html
│   ├── for-stations.html
│   ├── drivers.html
│   ├── how-it-works.html
│   ├── security.html
│   ├── pricing.html
│   ├── about.html
│   ├── contact.html
│   └── legal/
│       ├── privacy.html
│       └── terms.html
└── assets/
    ├── styles.css                Single design-system stylesheet
    ├── script.js                 Form handling, nav toggle, analytics stub
    ├── logo.svg
    └── favicon.svg
```

## Run locally

Any static file server works. From this directory:

```bash
python3 -m http.server 8000
# or
npx serve .
```

Open <http://localhost:8000/>.

## Deploy

Drop the whole tree behind Nginx (or any static host). Suggested Nginx vhost root:

```nginx
server {
  listen 443 ssl http2;
  server_name fuelflow.eg www.fuelflow.eg;
  root /var/www/fuelflow-website;
  index index.html;
  error_page 404 /404.html;
  location / { try_files $uri $uri/ $uri.html =404; }
  location /ar/ { try_files $uri $uri/ $uri.html =404; }
}
```

## Internationalization

- Every public page exists at both `/<page>.html` and `/ar/<page>.html`.
- Each page declares `hreflang` to its sibling and to `x-default`.
- The Arabic mirror sets `lang="ar"` and `dir="rtl"`, and swaps Inter for Cairo.
- Layout flips automatically thanks to CSS logical properties.

## Analytics

The footer of every page calls `window.fuelflowTrack(event, props)`. By default it tries `posthog`, `plausible`, then `dataLayer`. Drop in either PostHog or Plausible by adding their script tag in the `<head>` — no code changes needed.

Tracked events:
- `demo_requested` (with source = page slug)
- `whatsapp_clicked`
- `app_store_clicked`
- `language_switched`
- `contact_form_submitted`

## Replace before launch

Search and replace the following placeholders:

| Placeholder | Replace with |
|---|---|
| `fuelflow.eg` | Real production domain |
| `+20 100 000 0000` / `201000000000` | Real sales WhatsApp / phone |
| `sales@fuelflow.eg` etc. | Real email aliases |
| `assets/og-cover.png` | Real OG image (1200×630) |

## Brand

- Primary: `#0A2540` (deep navy)
- Accent (CTAs): `#FF6B35` (warm orange)
- Typography: Inter (Latin), Cairo (Arabic) — both served from Google Fonts

## Launch checklist

See section 17 of the original `WEBSITE_BRIEF.md` for the full pre-launch checklist (DNS, TLS, OG previews, sitemap, Lighthouse targets, error tracking, etc.).
