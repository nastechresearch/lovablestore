# Lovable Store

**Where magic gift starts from.** A South African luxury-gifting storefront:
watches, fragrance, fashion, shoes and keepsakes, wrapped by hand in
Johannesburg. Next.js App Router storefront, admin suite, installable PWA and
Prisma/PostgreSQL backend.

## Stack

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Motion
- Prisma 6 on PostgreSQL (Supabase)
- PayFast checkout adapter, WebAuthn passkeys, role-gated admin
- Installable PWA (manifest, service worker, offline page)

## Local development

Requires Node.js 22 and a seeded PostgreSQL database.

```bash
npm ci
npx prisma generate
npm run dev
```

Environment lives in `.env` (never committed). Required keys:

| Key | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string (Supabase pooler) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase publishable/anon key |
| `NEXT_PUBLIC_SITE_URL` | Public site origin |
| `WEBAUTHN_RP_ID`, `WEBAUTHN_RP_NAME`, `WEBAUTHN_ORIGIN` | Passkey relying party |
| `ADMIN_PASSWORD`, `ADMIN_COOKIE_SECRET` | Admin gate |
| `PAYFAST_*` | Live checkout (leave blank for demo checkout) |

Seed the catalogue with `npm run db:seed`. The storefront needs a seeded
database for CI tests (`/product/meridian-classic-watch` is used as a fixture).

## Tests

Playwright covers four mobile widths (320–430px), all three themes
(light/dark/AMOLED), horizontal overflow, the app dock's tap targets and PWA
assets.

```bash
npx playwright install chromium
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 npm run test:e2e
```

Omit `PLAYWRIGHT_BASE_URL` to let Playwright start `next start` on port 3100
after a production build.

## GitHub Actions

| Workflow | Purpose |
| --- | --- |
| `.github/workflows/ci.yml` | Lint (advisory) and production build |
| `.github/workflows/mobile-themes.yml` | Playwright mobile and theme suite |
| `.github/workflows/pages.yml` | Deploys the install page in `site/` to GitHub Pages |

Repository secrets: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
Repository variable: `STORE_URL` (the HTTPS storefront the Pages install page
links to). Values are never committed; rotate any credential that has been
shared outside GitHub secrets.

GitHub Pages serves static files only, so it hosts the branded install page,
not the cart, accounts or database-backed storefront. The full app needs a
Node.js host.
