import Link from "next/link";
import { Boxes, Plus, Power, RefreshCw } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateShort } from "@/lib/format";
import {
  testConnectionAction,
  toggleConnectionAction,
} from "@/actions/admin-suppliers";
import { AdminHeading, EmptyState, StatusBadge } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

export default async function AdminSuppliersPage() {
  const connections = await prisma.supplierConnection.findMany({
    include: { _count: { select: { products: true, promos: true } } },
    orderBy: [{ kind: "asc" }, { name: "asc" }],
  });

  const connected = connections.filter(
    (connection) => connection.enabled && connection.status === "CONNECTED",
  ).length;
  const local = connections.filter((connection) => connection.kind === "LOCAL").length;

  return (
    <div className="space-y-6">
      <AdminHeading
        eyebrow="Sourcing"
        title="Suppliers"
        description={`${connections.length} connections, ${connected} live. ${local} local makers alongside global catalogue partners. Credentials are encrypted at rest.`}
        action={
          <Link href="/admin/suppliers/new" className="btn-primary min-h-10 px-4 text-[9px]">
            <Plus className="size-3.5" aria-hidden />
            New connection
          </Link>
        }
      />

      {connections.length === 0 ? (
        <EmptyState
          title="No supplier connections yet."
          copy="Add a CJ, AliExpress, local maker or custom API connection to start importing products."
          action={<Link href="/admin/suppliers/new" className="btn-primary min-h-10 px-4 text-[9px]">Add a connection</Link>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {connections.map((connection) => (
            <article key={connection.id} className="border border-line bg-cream p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-10 items-center justify-center bg-ink text-ivory">
                    <Boxes className="size-4" aria-hidden />
                  </span>
                  <div>
                    <Link href={`/admin/suppliers/${connection.id}`} className="font-display text-2xl leading-tight hover:text-oxblood">
                      {connection.name}
                    </Link>
                    <p className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-stone">
                      {connection.provider} · {connection.kind}
                    </p>
                  </div>
                </div>
                <StatusBadge status={connection.status} />
              </div>

              <dl className="mt-4 grid grid-cols-3 gap-3 border-y border-line py-3 text-[10px] text-stone">
                <div>
                  <dt className="uppercase tracking-[0.1em]">Products</dt>
                  <dd className="mt-1 font-display text-xl text-ink">{connection._count.products}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-[0.1em]">Promos</dt>
                  <dd className="mt-1 font-display text-xl text-ink">{connection._count.promos}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-[0.1em]">Markup</dt>
                  <dd className="mt-1 font-display text-xl text-ink">{connection.defaultMarkupPct}%</dd>
                </div>
              </dl>

              <p className="mt-3 text-[10px] leading-relaxed text-stone">
                {connection.lastTestedAt
                  ? `Tested ${formatDateShort(connection.lastTestedAt)}`
                  : "Not tested yet"}
                {connection.lastError ? ` · ${connection.lastError}` : ""}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/admin/suppliers/${connection.id}`} className="btn-outline min-h-9 px-3 text-[9px]">
                  Open
                </Link>
                <form action={testConnectionAction.bind(null, connection.id)}>
                  <button type="submit" className="btn-outline min-h-9 px-3 text-[9px]">
                    <RefreshCw className="size-3.5" aria-hidden />
                    Test
                  </button>
                </form>
                <form action={toggleConnectionAction.bind(null, connection.id)}>
                  <button
                    type="submit"
                    className={`inline-flex min-h-9 items-center gap-1.5 border px-3 text-[9px] uppercase tracking-[0.12em] transition-colors ${
                      connection.enabled
                        ? "border-line text-stone hover:border-ink"
                        : "border-oxblood/30 text-oxblood hover:bg-oxblood hover:text-ivory"
                    }`}
                  >
                    <Power className="size-3.5" aria-hidden />
                    {connection.enabled ? "Disable" : "Enable"}
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
