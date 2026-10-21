import Link from "next/link";
import { Mail, Scissors, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateShort, formatZAR } from "@/lib/format";
import { updateCustomRequestAction } from "@/actions/custom";
import { AdminHeading, EmptyState } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

const STATUSES = ["NEW", "QUOTED", "IN_PRODUCTION", "COMPLETED", "DECLINED"] as const;
const TABS = ["OPEN", "ALL", ...STATUSES] as const;

export default async function AdminStudioPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const flags = await searchParams;
  const tab = TABS.includes(flags.status as (typeof TABS)[number])
    ? (flags.status as (typeof TABS)[number])
    : "OPEN";

  const [requests, grouped] = await Promise.all([
    prisma.customRequest.findMany({
      where:
        tab === "ALL"
          ? {}
          : tab === "OPEN"
            ? { status: { in: ["NEW", "QUOTED"] } }
            : { status: tab },
      include: {
        connection: { select: { name: true, kind: true } },
        product: { select: { name: true, slug: true } },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 80,
    }),
    prisma.customRequest.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const counts = new Map(grouped.map((row) => [row.status, row._count._all]));
  const total = grouped.reduce((sum, row) => sum + row._count._all, 0);

  return (
    <div className="space-y-6">
      <AdminHeading
        eyebrow="Atelier"
        title="Custom requests"
        description={`${counts.get("NEW") ?? 0} new · ${counts.get("QUOTED") ?? 0} quoted · ${total} total. Confirm the maker, add a quote and move the request through production.`}
      />

      <div className="flex flex-wrap gap-1.5">
        {TABS.map((item) => {
          const active = tab === item;
          const count =
            item === "ALL"
              ? total
              : item === "OPEN"
                ? (counts.get("NEW") ?? 0) + (counts.get("QUOTED") ?? 0)
                : counts.get(item) ?? 0;
          return (
            <Link
              key={item}
              href={item === "OPEN" ? "/admin/studio" : `/admin/studio?status=${item}`}
              className={`inline-flex items-center gap-2 border px-3 py-2 text-[9px] uppercase tracking-[0.12em] transition-colors ${
                active
                  ? "border-ink bg-ink text-ivory"
                  : "border-line bg-cream text-stone hover:border-ink"
              }`}
            >
              {item.replace("_", " ").toLowerCase()}
              <span className={active ? "text-ivory/60" : "text-champagne-dark"}>{count}</span>
            </Link>
          );
        })}
      </div>

      {requests.length === 0 ? (
        <EmptyState
          title="No requests here."
          copy="Custom briefs submitted from the storefront atelier will appear here with colour, size and maker preferences."
        />
      ) : (
        <ul className="space-y-3">
          {requests.map((request) => (
            <li key={request.id} className="border border-line bg-cream p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-2xl leading-none">{request.ref}</span>
                    <span className="border border-line bg-ivory-deep/40 px-1.5 py-0.5 text-[8px] uppercase tracking-[0.1em] text-stone">
                      {request.status.replace("_", " ")}
                    </span>
                    <span className="text-[9px] text-stone">{formatDateShort(request.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-[12px] text-ink">
                    {request.quantity} × {request.garment} · {request.colour} · size {request.size} ·{" "}
                    {request.printStyle}
                    {request.monogram ? ` · “${request.monogram}”` : ""}
                  </p>
                  {request.notes ? (
                    <p className="mt-1 max-w-2xl text-[10.5px] leading-relaxed text-stone">
                      “{request.notes}”
                    </p>
                  ) : null}
                  <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9.5px] text-stone">
                    <span>{request.name}</span>
                    <a
                      href={`mailto:${request.email}`}
                      className="inline-flex items-center gap-1 text-oxblood hover:underline"
                    >
                      <Mail className="size-3" aria-hidden />
                      {request.email}
                    </a>
                    {request.phone ? <span>{request.phone}</span> : null}
                  </p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.1em] text-stone">
                    {request.connection
                      ? `${request.connection.name} · ${request.connection.kind === "LOCAL" ? "local maker" : "global maker"}`
                      : "Studio to match a maker"}
                    {request.product ? ` · inspired by ${request.product.name}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] uppercase tracking-[0.12em] text-stone">Quote</p>
                  <p className="mt-1 font-display text-xl">
                    {request.quote ? formatZAR(request.quote) : "—"}
                  </p>
                </div>
              </div>

              <form
                action={updateCustomRequestAction.bind(null, request.id)}
                className="mt-3 flex flex-wrap items-end gap-2 border-t border-line pt-3"
              >
                <div>
                  <label htmlFor={`status-${request.id}`} className="label">Status</label>
                  <select
                    id={`status-${request.id}`}
                    name="status"
                    defaultValue={request.status}
                    className="field min-w-[140px] py-2"
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor={`quote-${request.id}`} className="label">Quote (R)</label>
                  <input
                    id={`quote-${request.id}`}
                    name="quote"
                    defaultValue={request.quote ? (request.quote / 100).toFixed(2) : ""}
                    className="field w-32 py-2"
                    placeholder="0.00"
                    inputMode="decimal"
                  />
                </div>
                <button type="submit" className="btn-primary py-2.5">
                  <Scissors className="size-3.5" aria-hidden />
                  Save
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <div className="border border-line bg-ivory-deep/30 p-4 text-[10.5px] leading-relaxed text-stone">
        <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-champagne-dark">
          <Sparkles className="size-3.5" aria-hidden />
          Quote checklist
        </p>
        <p className="mt-2">
          Confirm fabric and colour against a physical swatch, state the sample and bulk lead times,
          and include delivery. Quoted requests stay in the open queue until they move to production.
        </p>
      </div>
    </div>
  );
}
