import Link from "next/link";
import type { Promo } from "@prisma/client";
import { ArrowRight, TicketPercent } from "lucide-react";
import { PromoCodeChip } from "@/components/promo/promo-code-chip";
import { formatPromoValue } from "@/lib/promos";
import { formatZAR } from "@/lib/format";

export function PromoStrip({ promos }: { promos: Promo[] }) {
  if (promos.length === 0) return null;

  return (
    <div className="border border-line bg-cream">
      <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <TicketPercent className="size-4 text-oxblood" strokeWidth={1.5} aria-hidden />
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em]">
            Offers on now
          </p>
        </div>
        <Link
          href="/promos"
          className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-stone transition-colors hover:text-oxblood"
        >
          All offers
          <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      </div>
      <div className="grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {promos.slice(0, 3).map((promo) => (
          <div key={promo.id} className="flex flex-col items-start gap-3 p-5">
            <PromoCodeChip code={promo.code} />
            <div>
              <p className="text-[11px] font-medium leading-snug">{formatPromoValue(promo)}</p>
              <p className="mt-1 text-[10px] leading-relaxed text-stone">
                {promo.label}
                {promo.minSubtotal > 0
                  ? ` · min ${formatZAR(promo.minSubtotal)}`
                  : ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
