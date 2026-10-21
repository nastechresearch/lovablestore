import { prisma } from "@/lib/prisma";

const CATEGORY_PALETTE: Record<string, { base: string; accent: string }> = {
  Watches: { base: "#5b1b2a", accent: "#b99a65" },
  Fragrance: { base: "#6f4c2c", accent: "#d8c9b6" },
  Women: { base: "#7a3a46", accent: "#e9d7cf" },
  Men: { base: "#3b332e", accent: "#b99a65" },
  Shoes: { base: "#5a4030", accent: "#d8c9b6" },
  Gifts: { base: "#5b1b2a", accent: "#e9d7cf" },
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrap(text: string, maxChars = 15, maxLines = 4): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (!current) {
      current = word;
    } else if (`${current} ${word}`.length <= maxChars) {
      current += ` ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, maxLines);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      name: true,
      category: true,
      tagline: true,
      sku: true,
      recipient: true,
    },
  });

  if (!product) {
    return new Response("Not found", { status: 404 });
  }

  const palette = CATEGORY_PALETTE[product.category] ?? {
    base: "#5b1b2a",
    accent: "#b99a65",
  };
  const lines = wrap(product.name.toUpperCase());
  const lineHeight = 78;
  const startY = 610 - ((lines.length - 1) * lineHeight) / 2;
  const title = lines
    .map(
      (line, index) =>
        `<tspan x="450" y="${startY + index * lineHeight}">${escapeXml(line)}</tspan>`,
    )
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1125" viewBox="0 0 900 1125" role="img" aria-label="${escapeXml(product.name)}">
  <defs>
    <linearGradient id="ivory" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fdfaf5"/>
      <stop offset="1" stop-color="#efe5d7"/>
    </linearGradient>
    <linearGradient id="arch" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${palette.base}"/>
      <stop offset="1" stop-color="#41111d"/>
    </linearGradient>
  </defs>
  <rect width="900" height="1125" fill="url(#ivory)"/>
  <path d="M170 940 L170 380 A280 280 0 0 1 730 380 L730 940 Z" fill="url(#arch)"/>
  <path d="M196 914 L196 383 A254 254 0 0 1 704 383 L704 914 Z" fill="none" stroke="${palette.accent}" stroke-opacity="0.55" stroke-width="1.5"/>
  <circle cx="450" cy="232" r="46" fill="none" stroke="${palette.accent}" stroke-width="1.5"/>
  <text x="450" y="247" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="34" letter-spacing="2" fill="${palette.accent}">V&amp;V</text>
  <text x="450" y="358" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="17" letter-spacing="6" fill="${palette.accent}">${escapeXml(product.category.toUpperCase())}</text>
  <text text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="62" letter-spacing="1" fill="#f8f3eb">${title}</text>
  <text x="450" y="800" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="26" fill="${palette.accent}">${escapeXml(product.tagline ?? "Considered gifting")}</text>
  <line x1="390" y1="842" x2="510" y2="842" stroke="${palette.accent}" stroke-opacity="0.6"/>
  <text x="450" y="1002" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="14" letter-spacing="5" fill="#75685f">VELVET &amp; VOW</text>
  <text x="450" y="1034" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="11" letter-spacing="3" fill="#75685f">${escapeXml(product.sku)} · MADE TO ORDER</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
