import Link from "next/link";
import { BadgePercent, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateShort, formatZAR } from "@/lib/format";
import { formatPromoValue, promoIsLive } from "@/lib/promos";
import { deletePromoAction, togglePromoAction } from "@/actions/admin-promos";
import { AdminHeading, EmptyState } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

function scopeLabel(
  promo: { scope: string; scopeValue: string | null },
  tags: Map<string, string>,
  suppliers: Map<string, string>,
): string {
  if (promo.scope === "ALL") return "Everything";
  if (promo.scope === "TAG") return `Tag · ${tags.get(promo.scopeValue ?? "") ?? promo.scopeValue ?? "—"}`;
  if (promo.scope === "SUPPLIER") return `Supplier · ${suppliers.get(promo.scopeValue ?? "") ?? "—"}`;
  if (promo.scope === "SUPPLIER_KIND") {
    return promo.scopeValue === "LOCAL" ? "Local sourcing" : promo.scopeValue === "CHINA" ? "Global sourcing" : "Regional sourcing";
  }
  if (promo.scope === "PRODUCT") return "Single product";
  return `${promo.scope.charAt(0)}${promo.scope.slice(1).toLowerCase()} · ${promo.scopeValue ?? "—"}`;
}

function promoState(promo: {
  active: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  maxUses: number | null;
  usedCount: number;
}): { label: string; tone: string } {
  if (!promo.active) return { label: "Paused", tone: "bg-ink/8 text-stone" };
  if (promoIsLive(promo)) return { label: "Live", tone: "bg-oxblood/10 text-oxblood" };
  if (promo.startsAt && promo.startsAt > new Date()) {
    return { label: "Scheduled", tone: "bg-champagne/20 text-champagne-dark" };
  }
  return { label: "Ended", tone: "bg-ink/8 text-stone" };
}

export default async function AdminPromosPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; saved?: string }>;
}) {
  const flags = await searchParams;
  const [promos, tags, suppliers] = await Promise.all([
    prisma.promo.findMany({ orderBy: [{ active: "desc" }, { createdAt: "desc" }] }),
    prisma.tag.findMany({ select: { slug: true, name: true } }),
    prisma.supplierConnection.findMany({ select: { id: true, name: true } }),
  ]);

  const tagMap = new Map(tags.map((tag) => [tag.slug, tag.name]));
  const supplierMap = new Map(suppliers.map((supplier) => [supplier.id, supplier.name]));
  const live = promos.filter((promo) => promoIsLive(promo)).length;
  const redemptions = promos.reduce((sum, promo) => sum + promo.usedCount, 0);

  return (
    <div className="space-y-6">
      <AdminHeading
        eyebrow="Marketing"
        title="Promos"
        description={`${promos.length} codes · ${live} live · ${redemptions} redemptions. Scope offers to categories, tags, products, suppliers or local sourcing.`}
        action={
          <Link href="/admin/promos/new" className="btn-primary min-h-10 px-4 text-[9px]">
            <Plus className="size-3.5" aria-hidden />
            New promo
          </Link>
        }
      />

      {flags.created ? (
        <p role="status" className="border border-oxblood/25 bg-oxblood/5 px-4 py-3 text-[11px] text-oxblood">
          Promo created.
        </p>
      ) : null}
      {flags.saved ? (
        <p role="status" className="border border-oxblood/25 bg-oxblood/5 px-4 py-3 text-[11px] text-oxblood">
          Promo saved.
        </p>
      ) : null}

      {promos.length === 0 ? (
        <EmptyState
          title="No promos yet."
          copy="Create a code to reward first orders, run a local-only offer or celebrate a Mzansi moment."
          action={<Link href="/admin/promos/new" className="btn-primary min-h-10 px-4 text-[9px]">Create a promo</Link>}
        />
      ) : (
        <div className="overflow-x-auto border border-line bg-cream">
          <table className="w-full min-w-[900px] text-left text-[12px]">
            <thead>
              <tr className="border-b border-line text-[8.5px] uppercase tracking-[0.14em] text-stone">
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-3 py-3 font-medium">Offer</th>
                <th className="px-3 py-3 font-medium">Applies to</th>
                <th className="px-3 py-3 font-medium">Minimum</th>
                <th className="px-3 py-3 font-medium">Usage</th>
                <th className="px-3 py-3 font-medium">Window</th>
                <th className="px-3 py-3 font-medium">State</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {promos.map((promo) => {
                const state = promoState(promo);
                return (
                  <tr key={promo.id} className="transition-colors hover:bg-ivory/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <BadgePercent className="size-3.5 text-champagne-dark" aria-hidden />
                        <Link href={`/admin/promos/${promo.id}`} className="font-medium tracking-[0.04em] text-oxblood hover:underline">
                          {promo.code}
                        </Link>
                      </div>
                      <p className="mt-0.5 max-w-[220px] truncate text-[9.5px] text-stone">{promo.label}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium">{formatPromoValue(promo)}</p>
                      <p className="text-[9.5px] uppercase tracking-[0.08em] text-stone">{promo.type}</p>
                    </td>
                    <td className="px-3 py-3 text-[10.5px] text-stone">
                      {scopeLabel(promo, tagMap, supplierMap)}
                    </td>
                    <td className="px-3 py-3 text-[10.5px] text-stone">
                      {promo.minSubtotal > 0 ? formatZAR(promo.minSubtotal) : "None"}
                    </td>
                    <td className="px-3 py-3 text-[10.5px] text-stone">
                      {promo.usedCount}
                      {promo.maxUses ? ` / ${promo.maxUses}` : ""}
                    </td>
                    <td className="px-3 py-3 text-[10px] leading-relaxed text-stone">
                      {promo.startsAt ? formatDateShort(promo.startsAt) : "Now"}
                      <br />
                      {promo.endsAt ? formatDateShort(promo.endsAt) : "No end"}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex px-2 py-1 text-[8.5px] font-medium uppercase tracking-[0.12em] ${state.tone}`}>
                        {state.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <form action={togglePromoAction.bind(null, promo.id)}>
                          <button type="submit" className="text-[9px] uppercase tracking-[0.1em] text-stone hover:text-oxblood">
                            {promo.active ? "Pause" : "Activate"}
                          </button>
                        </form>
                        <Link href={`/admin/promos/${promo.id}`} className="text-[9px] uppercase tracking-[0.1em] text-oxblood hover:underline">
                          Edit
                        </Link>
                        <form action={deletePromoAction.bind(null, promo.id)}>
                          <button type="submit" className="text-[9px] uppercase tracking-[0.1em] text-stone hover:text-oxblood">
                            {promo.usedCount > 0 ? "Retire" : "Delete"}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[10px] text-stone">
        Used promos are paused instead of deleted so order history stays intact.
      </p>
    </div>
  );
}
