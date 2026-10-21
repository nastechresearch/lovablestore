import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

export type CjCredentials = {
  email: string;
  apiKey: string;
};

export type SupplierProduct = {
  id: string;
  name: string;
  imageUrl: string | null;
  cost: number | null;
  currency: string;
  category: string | null;
  description: string | null;
  url: string | null;
  raw: Record<string, unknown>;
};

export const CJ_DEFAULT_BASE = "https://developers.cjdropshipping.com/api2.0/v1";

const CURRENCY_RATES: Record<string, number> = {
  ZAR: 1,
  USD: Number(process.env.USD_ZAR_RATE || 18.5),
  EUR: Number(process.env.EUR_ZAR_RATE || 20.1),
  GBP: Number(process.env.GBP_ZAR_RATE || 23.6),
  CNY: Number(process.env.CNY_ZAR_RATE || 2.55),
};

export function toZarCents(
  amountInCurrency: number,
  currency: string,
): number {
  const rate = CURRENCY_RATES[currency.toUpperCase()] ?? 1;
  return Math.round(amountInCurrency * rate * 100);
}

export function retailPriceFromCost(
  costZarCents: number,
  markupPct: number,
): number {
  const raw = costZarCents * (1 + markupPct / 100);
  return Math.max(1000, Math.ceil(raw / 1000) * 1000);
}

async function readJson(response: Response): Promise<Record<string, unknown> | null> {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^0-9.]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function cjToken(payload: Record<string, unknown> | null): string | null {
  if (!payload) return null;
  const data = asRecord(payload.data);
  const result = asRecord(payload.result);
  return (
    asString(data?.accessToken) ??
    asString(result?.accessToken) ??
    asString(payload.accessToken)
  );
}

export async function cjTestConnection(
  credentials: CjCredentials,
  baseUrl = CJ_DEFAULT_BASE,
): Promise<{ ok: boolean; message: string }> {
  if (!credentials.email || !credentials.apiKey) {
    return { ok: false, message: "Add both the CJ account email and API key." };
  }

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/authentication/getAccessToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.apiKey,
      }),
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    });
    const payload = await readJson(response);
    const token = cjToken(payload);

    if (response.ok && token) {
      return { ok: true, message: "CJ authentication succeeded. Credentials saved." };
    }

    const message =
      asString(payload?.message) ||
      asString(payload?.msg) ||
      `CJ responded with ${response.status}.`;
    return { ok: false, message };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not reach the CJ API.";
    return { ok: false, message };
  }
}

export async function cjSearchProducts(
  credentials: CjCredentials,
  baseUrl: string,
  query: string,
): Promise<{ ok: boolean; message: string; products: SupplierProduct[] }> {
  if (!credentials.email || !credentials.apiKey) {
    return {
      ok: false,
      message: "Add CJ credentials in Connections first.",
      products: [],
    };
  }

  try {
    const auth = await fetch(
      `${baseUrl.replace(/\/$/, "")}/authentication/getAccessToken`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.apiKey,
        }),
        signal: AbortSignal.timeout(15000),
        cache: "no-store",
      },
    );
    const authPayload = await readJson(auth);
    const token = cjToken(authPayload);
    if (!token) {
      return {
        ok: false,
        message: asString(authPayload?.message) || "CJ authentication failed.",
        products: [],
      };
    }

    const url = new URL(`${baseUrl.replace(/\/$/, "")}/product/list`);
    url.searchParams.set("pageNum", "1");
    url.searchParams.set("pageSize", "24");
    if (query.trim()) url.searchParams.set("productNameEn", query.trim());

    const response = await fetch(url, {
      headers: { "CJ-Access-Token": token },
      signal: AbortSignal.timeout(20000),
      cache: "no-store",
    });
    const payload = await readJson(response);
    const data = asRecord(payload?.data);
    const list = asArray(data?.list ?? data?.content ?? asRecord(payload?.result)?.list);

    const products = list
      .map((entry): SupplierProduct | null => {
        const item = asRecord(entry);
        if (!item) return null;
        const id = asString(item.pid ?? item.productId ?? item.id);
        const name = asString(item.productNameEn ?? item.productName ?? item.name);
        if (!id || !name) return null;
        const imageValue = asString(item.productImage ?? item.image ?? item.productImageUrl);
        const imageUrl = imageValue ? imageValue.split(",")[0].trim() : null;
        const price = asNumber(item.sellPrice ?? item.price ?? item.productPrice);
        return {
          id,
          name,
          imageUrl,
          cost: price,
          currency: "USD",
          category: asString(item.categoryName ?? item.category),
          description: asString(item.description),
          url: `https://www.cjdropshipping.com/product/-p-${id}.html`,
          raw: item,
        };
      })
      .filter((product): product is SupplierProduct => Boolean(product));

    return {
      ok: true,
      message: products.length
        ? `${products.length} products found.`
        : "No products matched that search.",
      products,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "CJ search failed.",
      products: [],
    };
  }
}

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export async function downloadSupplierImage(
  imageUrl: string | null | undefined,
  slug: string,
): Promise<string | null> {
  if (!imageUrl) return null;
  let parsed: URL;
  try {
    parsed = new URL(imageUrl);
  } catch {
    return null;
  }
  if (!["http:", "https:"].includes(parsed.protocol)) return null;

  try {
    const response = await fetch(parsed, {
      signal: AbortSignal.timeout(15000),
      headers: { "User-Agent": "LovableStoreCatalogBot/1.0" },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const contentType = (response.headers.get("content-type") || "")
      .split(";")[0]
      .trim()
      .toLowerCase();
    const extension = IMAGE_EXTENSIONS[contentType];
    if (!extension) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength > 8 * 1024 * 1024) return null;

    const directory = path.join(process.cwd(), "public", "images", "imports");
    await mkdir(directory, { recursive: true });
    const filename = `${slug}-${randomBytes(4).toString("hex")}.${extension}`;
    await writeFile(path.join(directory, filename), buffer);
    return `/images/imports/${filename}`;
  } catch {
    return null;
  }
}

export function supplierKindLabel(kind: string): string {
  if (kind === "CHINA") return "Global find";
  if (kind === "LOCAL") return "Locally sourced";
  return kind;
}
