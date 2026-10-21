import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { updatePromoAction, deletePromoAction } from "@/actions/admin-promos";
import { randsFromCents } from "@/lib/form";
import { formatDateShort } from "@/lib/format";
import { promoIsLive } from "@/lib/promos";
import { AdminHeading } from "@/components/admin/admin-ui";
import { PromoForm, type PromoFormValues } from "@/components/admin/promo-form";

export const dynamic = "force-dynamic";

function toLocalInput(date: Date | null): string {
  if (!date) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export default async function EditPromoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const flags = await searchParams;

  const [promo, tags, products, suppliers] = await Promise.all([
    prisma.promo.findUnique({ where: { id } }),
    prisma.tag.findMany({ orderBy: { name: "asc" }, select: { slug: true, name: true } }),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.supplierConnection.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, kind: true },
    }),
  ]);

  if (!promo) notFound();

  const values: PromoFormValues = {
    code: promo.code,
    label: promo.label,
    description: promo.description ?? "",
    type: promo.type,
    value: promo.type === "FIXED" ? randsFromCents(promo.value) : String(promo.value),
    minSubtotal: randsFromCents(promo.minSubtotal),
    scope: promo.scope,
    scopeValue: promo.scopeValue ?? "",
    startsAt: toLocalInput(promo.startsAt),
    endsAt: toLocalInput(promo.endsAt),
    maxUses: promo.maxUses ? String(promo.maxUses) : "",
    active: promo.active,
  };

  return (
    <div className="space-y-6">
      <AdminHeading
        eyebrow="Marketing"
        title={promo.code}
        description={`${promoIsLive(promo) ? "Live now" : promo.active ? "Not currently live" : "Paused"} · ${promo.usedCount} redemptions${
          promo.maxUses ? ` of ${promo.maxUses}` : ""
        } · created ${formatDateShort(promo.createdAt)}`}
        action={
          <Link href="/admin/promos" className="btn-outline min-h-10 px-4 text-[9px]">
            <ArrowLeft className="size-3.5" aria-hidden />
            All promos
          </Link>
        }
      />

      {flags.saved ? (
        <p role="status" className="border border-oxblood/25 bg-oxblood/5 px-4 py-3 text-[11px] text-oxblood">
          Promo saved.
        </p>
      ) : null}

      <PromoForm
        action={updatePromoAction.bind(null, promo.id)}
        values={values}
        tags={tags}
        products={products}
        suppliers={suppliers}
        submitLabel="Save promo"
      />

      <section className="border border-oxblood/25 bg-oxblood/[0.03] p-5">
        <h2 className="font-display text-2xl text-oxblood">
          {promo.usedCount > 0 ? "Retire this promo" : "Delete this promo"}
        </h2>
        <p className="mt-1 max-w-xl text-[11px] leading-relaxed text-stone">
          {promo.usedCount > 0
            ? "This code has been used, so it will be paused rather than deleted. Past orders keep their discount and label."
            : "This code has never been used, so it can be removed completely."}
        </p>
        <form action={deletePromoAction.bind(null, promo.id)} className="mt-4">
          <button
            type="submit"
            className="inline-flex min-h-10 items-center gap-2 border border-oxblood/40 px-4 text-[9px] uppercase tracking-[0.14em] text-oxblood transition-colors hover:bg-oxblood hover:text-ivory"
          >
            <Trash2 className="size-3.5" aria-hidden />
            {promo.usedCount > 0 ? "Retire promo" : "Delete promo"}
          </button>
        </form>
      </section>
    </div>
  );
}
