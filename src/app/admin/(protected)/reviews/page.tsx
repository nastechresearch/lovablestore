import Link from "next/link";
import { Check, ExternalLink, ShieldCheck, Star, Trash2, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateShort } from "@/lib/format";
import {
  deleteReviewAction,
  setReviewStatusAction,
} from "@/actions/reviews";
import { AdminHeading, EmptyState } from "@/components/admin/admin-ui";
import { Stars } from "@/components/product/stars";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "PENDING", label: "Pending" },
  { key: "APPROVED", label: "Published" },
  { key: "REJECTED", label: "Rejected" },
  { key: "ALL", label: "All" },
] as const;

type Tab = (typeof TABS)[number]["key"];

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const flags = await searchParams;
  const tab: Tab = TABS.some((item) => item.key === flags.status)
    ? (flags.status as Tab)
    : "PENDING";

  const [reviews, grouped] = await Promise.all([
    prisma.review.findMany({
      where: tab === "ALL" ? {} : { status: tab },
      include: { product: { select: { name: true, slug: true } } },
      orderBy: [{ verified: "desc" }, { createdAt: "desc" }],
      take: 100,
    }),
    prisma.review.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const counts = new Map(grouped.map((row) => [row.status, row._count._all]));
  const total = grouped.reduce((sum, row) => sum + row._count._all, 0);

  return (
    <div className="space-y-6">
      <AdminHeading
        eyebrow="Community"
        title="Reviews"
        description={`${total} reviews across the house · ${counts.get("PENDING") ?? 0} waiting for a check. Verified purchases publish automatically.`}
      />

      <div className="flex flex-wrap gap-1.5">
        {TABS.map((item) => {
          const active = tab === item.key;
          const count = item.key === "ALL" ? total : counts.get(item.key) ?? 0;
          return (
            <Link
              key={item.key}
              href={item.key === "PENDING" ? "/admin/reviews" : `/admin/reviews?status=${item.key}`}
              className={`inline-flex items-center gap-2 border px-3 py-2 text-[9px] uppercase tracking-[0.12em] transition-colors ${
                active
                  ? "border-ink bg-ink text-ivory"
                  : "border-line bg-cream text-stone hover:border-ink"
              }`}
            >
              {item.label}
              <span className={active ? "text-ivory/60" : "text-champagne-dark"}>{count}</span>
            </Link>
          );
        })}
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          title={tab === "PENDING" ? "Nothing waiting." : "No reviews here yet."}
          copy={
            tab === "PENDING"
              ? "New guest reviews will appear here for moderation."
              : "Reviews will appear here as customers share their experience."
          }
        />
      ) : (
        <ul className="space-y-3">
          {reviews.map((review) => (
            <li key={review.id} className="border border-line bg-cream p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Stars rating={review.rating} />
                    <span className="text-[9px] uppercase tracking-[0.1em] text-stone">
                      {review.rating}/5
                    </span>
                    {review.verified ? (
                      <span className="inline-flex items-center gap-1 border border-oxblood/25 bg-oxblood/5 px-1.5 py-0.5 text-[8px] uppercase tracking-[0.1em] text-oxblood">
                        <ShieldCheck className="size-2.5" aria-hidden />
                        Verified
                      </span>
                    ) : null}
                    <span
                      className={`border px-1.5 py-0.5 text-[8px] uppercase tracking-[0.1em] ${
                        review.status === "APPROVED"
                          ? "border-champagne-dark/30 bg-champagne/15 text-champagne-dark"
                          : review.status === "REJECTED"
                            ? "border-line bg-ivory-deep/40 text-stone"
                            : "border-oxblood/25 bg-oxblood/5 text-oxblood"
                      }`}
                    >
                      {review.status}
                    </span>
                  </div>
                  <p className="mt-2 font-display text-xl">{review.title}</p>
                  <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-stone">
                    {review.body}
                  </p>
                  <p className="mt-2 text-[9.5px] text-stone">
                    {review.name} · {review.email} · {formatDateShort(review.createdAt)} ·{" "}
                    <Link
                      href={`/product/${review.product.slug}`}
                      className="inline-flex items-center gap-1 text-oxblood hover:underline"
                    >
                      {review.product.name}
                      <ExternalLink className="size-2.5" aria-hidden />
                    </Link>
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                  {review.status !== "APPROVED" ? (
                    <form action={setReviewStatusAction.bind(null, review.id, "APPROVED")}>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 border border-oxblood/30 bg-oxblood/5 px-2.5 py-1.5 text-[8.5px] uppercase tracking-[0.1em] text-oxblood transition-colors hover:bg-oxblood hover:text-ivory"
                      >
                        <Check className="size-3" aria-hidden />
                        Publish
                      </button>
                    </form>
                  ) : null}
                  {review.status !== "REJECTED" ? (
                    <form action={setReviewStatusAction.bind(null, review.id, "REJECTED")}>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 border border-line bg-cream px-2.5 py-1.5 text-[8.5px] uppercase tracking-[0.1em] text-stone transition-colors hover:border-ink hover:text-ink"
                      >
                        <X className="size-3" aria-hidden />
                        Reject
                      </button>
                    </form>
                  ) : null}
                  <form action={deleteReviewAction.bind(null, review.id)}>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 border border-line bg-cream px-2.5 py-1.5 text-[8.5px] uppercase tracking-[0.1em] text-stone transition-colors hover:border-oxblood hover:text-oxblood"
                    >
                      <Trash2 className="size-3" aria-hidden />
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="border border-line bg-ivory-deep/30 p-4 text-[10.5px] leading-relaxed text-stone">
        <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-champagne-dark">
          <Star className="size-3.5" aria-hidden />
          Moderation notes
        </p>
        <p className="mt-2">
          Publishing or rejecting recalculates the product&rsquo;s rating and review count. Only
          approved reviews appear on the storefront and in structured data.
        </p>
      </div>
    </div>
  );
}
