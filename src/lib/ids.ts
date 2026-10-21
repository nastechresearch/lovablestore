import { randomInt } from "crypto";

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

const CATEGORY_CODES: Record<string, string> = {
  Watches: "WCH",
  Fragrance: "FRG",
  Women: "WOM",
  Men: "MEN",
  Shoes: "SHO",
  Gifts: "GFT",
};

export function generateSku(category: string): string {
  const prefix = CATEGORY_CODES[category] ?? "GEN";
  const stamp = Date.now().toString(36).slice(-5).toUpperCase();
  const suffix = randomInt(100, 999);
  return `LS-${prefix}-${stamp}${suffix}`;
}

export function generateEan13(): string {
  const base = `200${String(randomInt(0, 1_000_000_000)).padStart(9, "0")}`;
  let sum = 0;
  for (let index = 0; index < 12; index += 1) {
    sum += Number(base[index]) * (index % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return `${base}${check}`;
}

export function generateAccountId(): string {
  return `LS-${randomInt(10_000_000, 99_999_999)}`;
}

export function orderNumber(): string {
  const now = new Date();
  const stamp = [
    String(now.getFullYear()).slice(2),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  return `LS-${stamp}-${randomInt(1000, 9999)}`;
}
