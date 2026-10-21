# Atelier Express — high-end motion, packing and live delivery

Date: 2026-10-22
Status: approved design, pending implementation plan

## 1. Goal

Make Lovable Store feel like a luxury South African atelier with a live
courier service, not a template storefront. Three new experiences anchor the
upgrade:

1. A branded live delivery map with a moving courier and real South African
   geography.
2. A packing theatre that shows the gift being assembled and tied.
3. A consistent premium motion and icon language across the storefront,
   product, cart, checkout and order surfaces.

Everything must work on mobile, in all three themes, with reduced motion, and
inside the Android shell. No new runtime dependencies, no schema changes and
no invented real-world data.

## 2. Non-goals

- Real courier GPS or telematics. There is no provider feed or API key; the
  map is explicitly an estimated last-mile preview.
- Real street-level basemap tiles. The map is a bundled, branded vector map.
- Changes to payments, authentication, order access rules or checkout data.
- Replacing Lucide icons wholesale. Lucide stays for utility controls; the
  custom set covers the brand and delivery moments.

## 3. Experience direction

Visual thesis: "Atelier Express" — warm ivory paper, oxblood ink, champagne
metal, precise movement. Motion is confident and slow enough to read, never
bouncy or cartoonish. The map and packing scene are the two memorable moments;
everything else supports them quietly.

### 3.1 Motion foundation

- Add `src/lib/motion.ts` with:
  - `EASE_SILK = [0.22, 1, 0.36, 1]`
  - `EASE_OUT = [0.16, 1, 0.3, 1]`
  - `DURATION = { quick: 0.18, base: 0.32, slow: 0.56, scene: 0.9 }`
  - `STAGGER = 0.07`
- Upgrade `Reveal` to accept `delay`, `distance`, `blur` and `as`, while
  keeping its current API working.
- Wrap the app in `MotionConfig reducedMotion="user"` so every Motion
  animation honours the OS setting. Keep the CSS reduced-motion block in
  `globals.css`.
- Animate only `transform`, `opacity` and SVG path lengths. No layout
  properties, no infinite background animations, no animation while the tab
  is hidden.

### 3.2 Custom animated icon set

New `src/components/icons/atelier-icons.tsx` with a consistent 24×24,
1.5-stroke, rounded set:

`AtelierBox`, `GiftRibbon`, `CourierVan`, `DeliveryRoute`, `MapPin`,
`ShieldCheck`, `Spark`, `Receipt`, `Plane`, `CheckSeal`.

Each icon accepts `size`, `className` and `animated`; animated icons draw
their primary path on first view using Motion `pathLength`. The set is used in
the delivery journey, packing scene, trust promises and order timeline. Lucide
remains for search, arrows, quantity controls and form controls.

### 3.3 Packing theatre

New client component `src/components/delivery/packing-scene.tsx`:

- Props: `status`, `items: { name: string; image: string }[]`.
- Scene layers, back to front: table shadow, box base, inner lining, tissue
  sheets, up to three product cards, ribbon cross, bow, gift note, wax stamp,
  sparkle particles.
- Sequence on first view: box rises, tissue unfurls, products settle, ribbon
  closes, bow ties, note drops, stamp presses.
- Status mapping:
  - `PENDING` / `PAID`: box open, products and tissue visible, soft pulse;
    ribbon and stamp hidden. Caption "Being packed at the atelier".
  - `PACKED` / `SHIPPED`: full sequence completes and settles sealed.
  - `DELIVERED`: sealed scene with the check seal and a single gold shimmer.
  - `CANCELLED`: no scene.
- A "Replay packing" button appears for packed states. With reduced motion,
  render the final frame and hide the button.
- Placement: order confirmation (`/order/[number]`) and tracking page. The
  account order history links through to the order confirmation rather than
  embedding the scene.
- All layers are CSS 3D transforms and SVG; no Three.js or images beyond the
  existing product thumbnails.

### 3.4 Live delivery map

New pure module `src/lib/delivery-track.ts` and client component
`src/components/delivery/live-delivery-map.tsx`.

**Geography**

- Bundle simplified South African province boundaries in
  `src/lib/sa-geo.ts` from public-domain Natural Earth data, stored as SVG
  path strings with province names.
- Projection: equirectangular over lng 16–33, lat −35 to −22, fitted to a
  900×640 viewBox.
- Studio origin: Rosebank, Johannesburg (−26.146, 28.041).
- Destination: `findPlace(order.city, order.province)` from
  `src/lib/sa-locations.ts`; fall back to the province centroid, then
  Johannesburg. Coordinates stay server-side until passed as props to the
  authorized order page.

**Route**

- `buildRoute(origin, destination)` returns a cubic Bézier with a lateral
  control-point offset proportional to distance, so the line reads like a
  road rather than a ruler.
- Marker position is sampled along the path with `getPointAtLength` from a
  hidden SVG path ref; no external routing service.

**States**

| Order status | Scene |
| --- | --- |
| PENDING, PAID, PACKED | Atelier view: studio pin, packing pulse, route ghosted, caption "Preparing in Rosebank" |
| SHIPPED | Last-mile preview: route draws, courier van travels from the local hub to the door once over ~75 s, headlight cone and radar pulse at the door, then holds at arrival |
| DELIVERED | Static arrival: van at the door, animated check seal, distance 0 km |
| CANCELLED | Map hidden |

- The SHIPPED animation is seeded from the order number for a consistent
  starting point and speed variation, but it is a preview, not GPS. The card
  carries a small "Estimated last-mile preview" label.
- Distance and ETA strings come from the delivery plan and order status, not
  from the animation frame.
- The courier card shows `order.courier` (provider) and `order.trackingNumber`
  when present. No invented driver names.
- Live updates: a small client effect calls `router.refresh()` every 45 s while
  the tab is visible and the order is not delivered/cancelled. Changing status
  restarts the scene through a `key`.
- Map chrome: province outlines, graticule, province labels, major city dots,
  studio and door pins, milestone rail (Atelier → Hub → Out for delivery →
  Door), distance/ETA chips, last-updated label.
- Placement: tracking page and order detail, in a bordered card matching the
  existing delivery journey panel. The old `RouteTrack` animation is replaced;
  `DeliveryJourney` keeps its timeline and reasons.

**Accessibility and honesty**

- The SVG has `role="img"` and an accessible description naming the origin,
  destination and current stage.
- Status text mirrors every map state for screen readers.
- Reduced motion: static route, marker at the stage-appropriate point, no
  radar, no countdown animation.
- The preview label is always visible when SHIPPED, so the map never claims
  real GPS.

### 3.5 Premium storefront pass

Bounded, high-impact changes using existing components:

- **Hero:** scroll parallax on the editorial image, floating seal, staggered
  headline already present; add a slow gold aura drift only when motion is
  allowed.
- **Product cards:** spring tilt on pointer (max 3°), image scale on hover,
  animated quick-add. On add, a small image chip flies from the card to the
  header bag icon via a portal overlay, then the bag icon pulses.
- **Product page:** animated gallery crossfade on thumbnail select, sticky
  mobile purchase bar, same fly-to-bag behavior.
- **Cart drawer:** spring entry, staggered line items, animated free-shipping
  progress bar with a champagne shimmer.
- **Checkout:** animated progress rail (Bag → Details → Payment → Confirm) and
  a subtle card-to-dock arrival pulse after the existing swipe confirmation.
- **Order confirmation:** packing scene above the timeline; map below for
  shipped orders.
- **Account orders:** count-up stats and staggered order cards.
- **About:** a compact SA route motif that draws once in the nationwide
  section.
- **Header/footer:** animated underlines, bag and wishlist count bumps.

No page-transition framework, no autoplay video, no continuous parallax.

## 4. Architecture

```
src/lib/motion.ts                     motion tokens
src/lib/delivery-track.ts             pure route, projection and stage helpers
src/lib/sa-geo.ts                     simplified province paths, centroids
src/components/icons/atelier-icons.tsx custom animated SVG set
src/components/motion/fly-to-bag.tsx  shared portal fly animation
src/components/motion/reveal.tsx      upgraded reveal primitive
src/components/delivery/packing-scene.tsx
src/components/delivery/live-delivery-map.tsx
src/components/delivery/delivery-journey.tsx   integrate map, keep timeline
src/components/providers.tsx          MotionConfig wrapper around existing providers
src/components/cart/cart-drawer.tsx   motion polish
src/components/product/product-card.tsx, product-purchase.tsx
src/app/(store)/order/[number]/page.tsx
src/app/(store)/track/page.tsx
src/app/(store)/account/(dashboard)/orders/page.tsx
src/app/(store)/about/page.tsx
src/app/(store)/checkout/*           progress rail
```

Data flow:

1. Server authorises the order with `findAuthorisedOrder` (unchanged).
2. Server computes `DeliveryPlan` and destination coordinates; it passes only
   what the page needs to client components.
3. `delivery-track.ts` derives a stable stage and route geometry on the client.
4. `LiveDeliveryMap` animates along the route; `PackingScene` animates the box.
5. `router.refresh()` re-runs the authorised server page every 45 s.

No new API routes, database tables or secrets.

## 5. Validation

- Playwright unit coverage for `delivery-track.ts`: projection round-trip,
  destination fallback, route endpoints, deterministic stage/progress seed.
- Playwright UI coverage on an authorised demo order:
  - tracking page shows the map and packing scene;
  - map exposes an accessible description and the estimated-preview label;
  - packing replay changes the scene state;
  - reduced motion renders a static map/packing scene with no infinite
    animations.
- Existing 48-viewport mobile/theme suite must stay green; new sections must
  not overflow at 360 px.
- `npm run lint`, `npm run build`, full Playwright suite.
- Live verification on Vercel (home, shop, product, checkout, order, track)
  and a fresh Android APK build.

## 6. Rollout

1. Motion tokens, icon set, upgraded reveal and reduced-motion config.
2. Packing scene and its placement.
3. Delivery-track helpers, map and tracking integration.
4. Storefront premium pass.
5. Tests, build, push, Vercel verification, APK rebuild.

Each step is a separate commit on `main`, keeping the site deployable
throughout.
