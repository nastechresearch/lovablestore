import { expect, test, type Page } from "@playwright/test";

const BASE: string =
  process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3100";

const THEMES = [
  {
    name: "light",
    meta: "#f8f3eb",
    background: "rgb(248, 243, 235)",
    scheme: "light",
  },
  {
    name: "dark",
    meta: "#12100e",
    background: "rgb(18, 16, 14)",
    scheme: "dark",
  },
  {
    name: "amoled",
    meta: "#000000",
    background: "rgb(0, 0, 0)",
    scheme: "dark",
  },
] as const;

const VIEWPORTS = [
  { width: 320, height: 720 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
];

const STOREFRONT_PAGES = [
  { name: "home", path: "/" },
  { name: "shop", path: "/shop" },
  { name: "product", path: "/product/meridian-classic-watch" },
  { name: "cart", path: "/cart" },
];

const PRODUCT_PATH = "/product/meridian-classic-watch";

async function expectTheme(page: Page, theme: (typeof THEMES)[number]) {
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-theme", theme.name);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.style.colorScheme))
    .toBe(theme.scheme);
  await expect
    .poll(() =>
      page.evaluate(() => getComputedStyle(document.body).backgroundColor),
    )
    .toBe(theme.background);
  await expect
    .poll(() =>
      page.evaluate(() =>
        Array.from(document.querySelectorAll('meta[name="theme-color"]')).map(
          (tag) => tag.getAttribute("content"),
        ),
      ),
    )
    .toContain(theme.meta);
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow, `page scrolls horizontally by ${overflow}px`).toBeLessThanOrEqual(
    1,
  );
}

for (const viewport of VIEWPORTS) {
  test.describe(`mobile ${viewport.width}px`, () => {
    for (const theme of THEMES) {
      test(`storefront stays within the ${theme.name} theme`, async ({
        browser,
      }) => {
        const context = await browser.newContext({
          viewport,
          isMobile: true,
          hasTouch: true,
          deviceScaleFactor: 1,
        });
        const page = await context.newPage();
        await page.addInitScript((value) => {
          window.localStorage.setItem("bm-theme", value);
        }, theme.name);

        for (const target of STOREFRONT_PAGES) {
          await test.step(target.name, async () => {
            await page.goto(`${BASE}${target.path}`, {
              waitUntil: "domcontentloaded",
            });
            await expectTheme(page, theme);
            await expectNoHorizontalOverflow(page);
          });
        }

        await context.close();
      });
    }

    test("app dock is thumb-sized and stays out of checkout flows", async ({
      browser,
    }) => {
      const context = await browser.newContext({
        viewport,
        isMobile: true,
        hasTouch: true,
      });
      const page = await context.newPage();
      await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });

      const dock = page.locator('nav[aria-label="Store app"]');
      await expect(dock).toBeVisible();

      const controls = dock.locator("a, button");
      await expect(controls).toHaveCount(5);
      const sizes = await controls.evaluateAll((nodes) =>
        nodes.map((node) => {
          const rect = node.getBoundingClientRect();
          return { width: rect.width, height: rect.height };
        }),
      );
      for (const size of sizes) {
        expect(size.height).toBeGreaterThanOrEqual(44);
        expect(size.width).toBeGreaterThanOrEqual(44);
      }

      await page.goto(`${BASE}${PRODUCT_PATH}`, {
        waitUntil: "domcontentloaded",
      });
      await expect(page.locator('nav[aria-label="Store app"]')).toHaveCount(0);
      await expectNoHorizontalOverflow(page);

      await page.goto(`${BASE}/checkout`, { waitUntil: "domcontentloaded" });
      await expect(page.locator('nav[aria-label="Store app"]')).toHaveCount(0);
      await expectNoHorizontalOverflow(page);

      await context.close();
    });
  });
}

test.describe("desktop", () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  test("full navigation is shown instead of the mobile dock", async ({
    page,
  }) => {
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
    await expect(page.locator('nav[aria-label="Primary"]')).toBeVisible();
    await expect(page.locator('nav[aria-label="Store app"]')).toBeHidden();
    await expectNoHorizontalOverflow(page);
  });

  test("theme buttons switch and remember all three themes", async ({
    page,
  }) => {
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });

    for (const theme of THEMES) {
      const label =
        theme.name === "amoled"
          ? "AMOLED black theme"
          : `${theme.name[0].toUpperCase()}${theme.name.slice(1)} theme`;
      await page.getByRole("button", { name: label }).first().click();
      await expectTheme(page, theme);
    }

    await page.reload({ waitUntil: "domcontentloaded" });
    await expectTheme(page, THEMES[2]);
  });
});

test.describe("installable app", () => {
  test("manifest, service worker and icons are served", async ({ request }) => {
    const manifest = await request.get(`${BASE}/manifest.webmanifest`);
    expect(manifest.status()).toBe(200);
    const json = await manifest.json();
    expect(json.name).toBe("Lovable Store — Where magic gift starts from");
    expect(json.short_name).toBe("Lovable");
    expect(json.display).toBe("standalone");

    const worker = await request.get(`${BASE}/sw.js`);
    expect(worker.status()).toBe(200);
    expect(await worker.text()).toContain("lovable-store-v3");

    for (const size of [192, 512]) {
      const icon = await request.get(`${BASE}/icons/icon-${size}.png`);
      expect(icon.status()).toBe(200);
      expect(icon.headers()["content-type"]).toContain("image/png");
    }
  });
});
