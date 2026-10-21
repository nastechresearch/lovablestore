"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { decryptJson, encryptJson } from "@/lib/crypto";
import { checkbox, centsFromRands, text, type FormState } from "@/lib/form";
import { generateEan13, generateSku, slugify } from "@/lib/ids";
import {
  CJ_DEFAULT_BASE,
  cjSearchProducts,
  cjTestConnection,
  downloadSupplierImage,
  retailPriceFromCost,
  toZarCents,
  type SupplierProduct,
} from "@/lib/suppliers";

const PROVIDERS = ["CJ", "ALIEXPRESS", "LOCAL", "CUSTOM"];
const KINDS = ["CHINA", "LOCAL", "REGIONAL"];

type Credentials = Record<string, string>;

function credentialInput(formData: FormData): Credentials | null {
  const credentials: Credentials = {};
  for (const key of ["email", "apiKey", "apiSecret", "accessToken", "contactName", "phone"]) {
    const value = text(formData, key);
    if (value) credentials[key] = value;
  }
  return Object.keys(credentials).length > 0 ? credentials : null;
}

async function parseConnection(formData: FormData) {
  const errors: Record<string, string> = {};
  const name = text(formData, "name");
  const provider = text(formData, "provider") || "CJ";
  const kind = text(formData, "kind") || "CHINA";
  const markup = Number(text(formData, "defaultMarkupPct") || "60");
  const leadMin = Number(text(formData, "defaultLeadMin") || "2");
  const leadMax = Number(text(formData, "defaultLeadMax") || "5");

  if (name.length < 2) errors.name = "Give the connection a name.";
  if (!PROVIDERS.includes(provider)) errors.provider = "Choose a provider.";
  if (!KINDS.includes(kind)) errors.kind = "Choose a source type.";
  if (!Number.isFinite(markup) || markup < 0 || markup > 500) {
    errors.defaultMarkupPct = "Markup must be between 0 and 500%.";
  }
  if (!Number.isFinite(leadMin) || leadMin < 0) errors.defaultLeadMin = "Enter valid days.";
  if (!Number.isFinite(leadMax) || leadMax < leadMin) {
    errors.defaultLeadMax = "Maximum lead time must be at least the minimum.";
  }

  return {
    errors,
    data: {
      name,
      provider,
      kind,
      enabled: checkbox(formData, "enabled"),
      apiBaseUrl: text(formData, "apiBaseUrl") || null,
      defaultMarkupPct: Math.floor(markup),
      defaultCurrency: text(formData, "defaultCurrency").toUpperCase() || "ZAR",
      defaultShipsFrom: text(formData, "defaultShipsFrom") || "South Africa",
      defaultLeadMin: Math.floor(leadMin),
      defaultLeadMax: Math.floor(leadMax),
      notes: text(formData, "notes") || null,
    },
  };
}

export async function createConnectionAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const { errors, data } = await parseConnection(formData);
  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Fix the highlighted fields.", fieldErrors: errors };
  }

  const credentials = credentialInput(formData);
  const connection = await prisma.supplierConnection.create({
    data: {
      ...data,
      status: credentials ? "UNTESTED" : "UNTESTED",
      credentialsEnc: credentials ? encryptJson(credentials) : null,
    },
  });

  revalidatePath("/admin/suppliers");
  redirect(`/admin/suppliers/${connection.id}?saved=1`);
}

export async function updateConnectionAction(
  id: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const existing = await prisma.supplierConnection.findUnique({ where: { id } });
  if (!existing) {
    return { status: "error", message: "That connection no longer exists." };
  }

  const { errors, data } = await parseConnection(formData);
  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Fix the highlighted fields.", fieldErrors: errors };
  }

  const supplied = credentialInput(formData);
  const clear = checkbox(formData, "clearCredentials");
  const existingCredentials = decryptJson<Credentials>(existing.credentialsEnc);
  const merged = clear
    ? null
    : supplied
      ? { ...(existingCredentials ?? {}), ...supplied }
      : existingCredentials;

  await prisma.supplierConnection.update({
    where: { id },
    data: {
      ...data,
      credentialsEnc: merged && Object.keys(merged).length ? encryptJson(merged) : null,
      status: clear ? "UNTESTED" : existing.status,
    },
  });

  revalidatePath("/admin/suppliers");
  revalidatePath(`/admin/suppliers/${id}`);
  redirect(`/admin/suppliers/${id}?saved=1`);
}

export async function testConnectionAction(id: string): Promise<void> {
  await requireAdmin();
  const connection = await prisma.supplierConnection.findUnique({ where: { id } });
  if (!connection) redirect("/admin/suppliers");

  const credentials = decryptJson<Credentials>(connection.credentialsEnc);

  if (connection.provider === "CJ") {
    if (!credentials?.email || !credentials?.apiKey) {
      await prisma.supplierConnection.update({
        where: { id },
        data: {
          status: "ERROR",
          lastTestedAt: new Date(),
          lastError: "Add the CJ account email and API key, then test again.",
        },
      });
    } else {
      const result = await cjTestConnection(
        { email: credentials.email, apiKey: credentials.apiKey },
        connection.apiBaseUrl || CJ_DEFAULT_BASE,
      );
      await prisma.supplierConnection.update({
        where: { id },
        data: {
          status: result.ok ? "CONNECTED" : "ERROR",
          lastTestedAt: new Date(),
          lastError: result.ok ? null : result.message,
        },
      });
    }
  } else {
    const ready = connection.provider === "LOCAL"
      ? true
      : Boolean(credentials?.apiKey || credentials?.accessToken);
    await prisma.supplierConnection.update({
      where: { id },
      data: {
        status: ready ? "CONNECTED" : "ERROR",
        lastTestedAt: new Date(),
        lastError: ready
          ? null
          : "Add the supplier credentials before testing this connection.",
      },
    });
  }

  revalidatePath("/admin/suppliers");
  revalidatePath(`/admin/suppliers/${id}`);
  redirect(`/admin/suppliers/${id}?tested=1`);
}

export async function toggleConnectionAction(id: string): Promise<void> {
  await requireAdmin();
  const connection = await prisma.supplierConnection.findUnique({ where: { id } });
  if (!connection) return;
  await prisma.supplierConnection.update({
    where: { id },
    data: { enabled: !connection.enabled },
  });
  revalidatePath("/admin/suppliers");
  revalidatePath(`/admin/suppliers/${id}`);
}

export type CjSearchResult = {
  ok: boolean;
  message: string;
  products: {
    id: string;
    name: string;
    imageUrl: string | null;
    cost: number | null;
    currency: string;
    category: string | null;
    description: string | null;
    url: string | null;
  }[];
};

export async function searchCjAction(
  connectionId: string,
  query: string,
): Promise<CjSearchResult> {
  await requireAdmin();
  const connection = await prisma.supplierConnection.findUnique({
    where: { id: connectionId },
  });
  if (!connection || connection.provider !== "CJ") {
    return { ok: false, message: "This is not a CJ connection.", products: [] };
  }
  const credentials = decryptJson<Credentials>(connection.credentialsEnc);
  if (!credentials?.email || !credentials?.apiKey) {
    return {
      ok: false,
      message: "Add your CJ email and API key in the connection settings first.",
      products: [],
    };
  }

  const result = await cjSearchProducts(
    { email: credentials.email, apiKey: credentials.apiKey },
    connection.apiBaseUrl || CJ_DEFAULT_BASE,
    query,
  );

  return {
    ok: result.ok,
    message: result.message,
    products: result.products.map((product: SupplierProduct) => ({
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      cost: product.cost,
      currency: product.currency,
      category: product.category,
      description: product.description,
      url: product.url,
    })),
  };
}

const IMPORT_CATEGORIES = ["Watches", "Fragrance", "Women", "Men", "Shoes", "Gifts"];

async function uniqueProductSlug(name: string): Promise<string> {
  const base = slugify(name) || `import-${Date.now()}`;
  let slug = base;
  let suffix = 2;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

export async function importSupplierProductAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const connectionId = text(formData, "connectionId");
  const name = text(formData, "name");
  const cost = Number(text(formData, "cost"));
  const currency = (text(formData, "currency") || "USD").toUpperCase();
  const category = text(formData, "category") || "Gifts";
  const recipient = text(formData, "recipient") || "For Her";
  const imageUrl = text(formData, "imageUrl");
  const supplierProductId = text(formData, "supplierProductId") || null;
  const supplierUrl = text(formData, "supplierUrl") || null;
  const description = text(formData, "description");
  const tags = text(formData, "tags") || "new";
  const stockValue = Number(text(formData, "stock") || "25");
  const leadMin = Number(text(formData, "leadMin") || "10");
  const leadMax = Number(text(formData, "leadMax") || "18");
  const markupOverride = Number(text(formData, "markupPct") || "0");

  const errors: Record<string, string> = {};
  if (!connectionId) errors.connectionId = "Choose a supplier connection.";
  if (name.length < 2) errors.name = "Give the imported product a name.";
  if (!Number.isFinite(cost) || cost <= 0) errors.cost = "Enter the supplier cost.";
  if (!IMPORT_CATEGORIES.includes(category)) errors.category = "Choose a category.";
  if (!Number.isFinite(leadMin) || leadMin < 0) errors.leadMin = "Enter valid lead days.";
  if (!Number.isFinite(leadMax) || leadMax < leadMin) errors.leadMax = "Maximum must be at least the minimum.";
  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Fix the highlighted fields.", fieldErrors: errors };
  }

  const connection = await prisma.supplierConnection.findUnique({
    where: { id: connectionId },
  });
  if (!connection) {
    return { status: "error", message: "That supplier connection no longer exists." };
  }

  const slug = await uniqueProductSlug(name);
  const downloaded = await downloadSupplierImage(imageUrl, slug);
  const costZar = toZarCents(cost, currency);
  const markup = markupOverride > 0 ? markupOverride : connection.defaultMarkupPct;
  const price = retailPriceFromCost(costZar, Math.floor(markup));
  const compareAt = Math.ceil((price * 1.25) / 1000) * 1000;

  const tagList = [...new Set(tags.split(",").map((tag) => tag.trim()).filter(Boolean))];
  const tagRefs: { id: string }[] = [];
  for (const tag of tagList) {
    const tagSlug = slugify(tag);
    if (!tagSlug) continue;
    const record = await prisma.tag.upsert({
      where: { slug: tagSlug },
      update: {},
      create: { name: tag, slug: tagSlug, kind: "STYLE" },
    });
    tagRefs.push({ id: record.id });
  }

  const product = await prisma.product.create({
    data: {
      slug,
      name,
      tagline: `Sourced through ${connection.name}`,
      description:
        description ||
        `${name}, sourced to order through ${connection.name}. Add detailed materials and sizing in the product editor before publishing broadly.`,
      price,
      compareAtPrice: compareAt,
      category,
      recipient,
      occasion: "Everyday",
      badge: connection.kind === "CHINA" ? "Global find" : "Local find",
      images: JSON.stringify(downloaded ? [downloaded] : []),
      sizes: "",
      colors: "",
      stock: Math.max(0, Math.floor(stockValue)),
      sku: generateSku(category),
      barcode: generateEan13(),
      supplier: connection.name,
      supplierCost: costZar,
      supplierConnectionId: connection.id,
      supplierProductId,
      supplierUrl,
      supplierCurrency: currency,
      supplierPrice: Math.round(cost * 100),
      shipsFrom: connection.defaultShipsFrom,
      leadTimeMin: Math.max(0, Math.floor(leadMin)),
      leadTimeMax: Math.max(0, Math.floor(leadMax)),
      status: "ACTIVE",
      featured: false,
      rating: 4.7,
      reviewCount: 0,
      reviews: "[]",
      tags: { connect: tagRefs },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/admin/suppliers");
  revalidatePath("/shop");
  revalidatePath("/");
  redirect(`/admin/products/${product.id}?imported=1`);
}
