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
- Animated card checkout (Visa/Mastercard/Amex/Discover detection, Luhn, 3D
  flip, swipe-to-confirm) and a 991-place South African location picker with
  live geolocation
- Capacitor 7 Android shell (WebView against the hosted storefront)

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
assets. It also unit-tests the card engine (network detection, Luhn, expiry,
CVV) and the South African place dataset (all nine provinces, nearest-place
geolocation).

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
| `.github/workflows/android.yml` | Builds the debug Android APK and uploads it as an artefact |
| `.github/workflows/pages.yml` | Deploys the install page in `site/` to GitHub Pages |

Repository secrets: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
Repository variable: `STORE_URL` (the HTTPS storefront the Pages install page
links to). Values are never committed; rotate any credential that has been
shared outside GitHub secrets.

GitHub Pages serves static files only, so it hosts the branded install page,
not the cart, accounts or database-backed storefront. The full app needs a
Node.js host.

## Android app

`android/` is a Capacitor 7 shell. It loads the hosted storefront in a WebView
(`server.url` in `capacitor.config.ts`, default
`https://lovablestore-two.vercel.app`), so the APK needs an internet
connection and always shows the latest deployed store. It is not an offline
native build.

```bash
npx cap sync android            # copy web assets and refresh plugins
cd android && ./gradlew assembleDebug
```

The debug APK lands at `android/app/build/outputs/apk/debug/app-debug.apk`.
Every push that touches the app or `android/` builds one in GitHub Actions;
download it from the latest **Android APK** run's artefacts. Debug APKs are
installable on Android 6+ after allowing installs from the browser/file
manager.

For a Play Store release you still need a signing keystore, a release build
(`bundleRelease`) and a Play Console listing. `CAPACITOR_SERVER_URL` can point
`cap sync` at a different origin (for example a staging deployment) without
editing the config.
