import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createPromoAction } from "@/actions/admin-promos";
import { AdminHeading } from "@/components/admin/admin-ui";
import { PromoForm, type PromoFormValues } from "@/components/admin/promo-form";

export const dynamic = "force-dynamic";

const DEFAULTS: PromoFormValues = {
  code: "",
  label: "",
  description: "",
  type: "PERCENT",
  value: "10",
  minSubtotal: "0",
  scope: "ALL",
  scopeValue: "",
  startsAt: "",
  endsAt: "",
  maxUses: "",
  active: true,
};

export default async function NewPromoPage() {
  const [tags, products, suppliers] = await Promise.all([
    prisma.tag.findMany({ orderBy: { name: "asc" }, select: { slug: true, name: true } }),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.supplierConnection.findMany({
      where: { enabled: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, kind: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <AdminHeading
        eyebrow="Marketing"
        title="New promo"
        description="Build an offer for the whole store, a single edit, a supplier or local sourcing."
        action={
          <Link href="/admin/promos" className="btn-outline min-h-10 px-4 text-[9px]">
            <ArrowLeft className="size-3.5" aria-hidden />
            All promos
          </Link>
        }
      />
      <PromoForm
        action={createPromoAction}
        values={DEFAULTS}
        tags={tags}
        products={products}
        suppliers={suppliers}
        submitLabel="Create promo"
      />
    </div>
  );
}
