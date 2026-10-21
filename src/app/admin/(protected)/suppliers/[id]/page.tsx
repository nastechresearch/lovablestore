import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Power, RefreshCw } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateShort, formatZAR } from "@/lib/format";
import {
  testConnectionAction,
  toggleConnectionAction,
  updateConnectionAction,
} from "@/actions/admin-suppliers";
import { AdminHeading, StatusBadge } from "@/components/admin/admin-ui";
import { SupplierForm, type ConnectionFormValues } from "@/components/admin/supplier-form";
import { CjImportPanel } from "@/components/admin/cj-import";

export const dynamic = "force-dynamic";

export default async function SupplierDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; tested?: string }>;
}) {
  const { id } = await params;
  const flags = await searchParams;

  const connection = await prisma.supplierConnection.findUnique({
    where: { id },
    include: {
      products: { orderBy: { createdAt: "desc" }, take: 20 },
      promos: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!connection) notFound();

  const values: ConnectionFormValues = {
    name: connection.name,
    provider: connection.provider,
    kind: connection.kind,
    enabled: connection.enabled,
    apiBaseUrl: connection.apiBaseUrl ?? "",
    defaultMarkupPct: connection.defaultMarkupPct,
    defaultCurrency: connection.defaultCurrency,
    defaultShipsFrom: connection.defaultShipsFrom,
    defaultLeadMin: connection.defaultLeadMin,
    defaultLeadMax: connection.defaultLeadMax,
    notes: connection.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <AdminHeading
        eyebrow={`${connection.provider} · ${connection.kind}`}
        title={connection.name}
        description={`${connection.products.length} linked products · ${
          connection.lastTestedAt ? `last tested ${formatDateShort(connection.lastTestedAt)}` : "not tested yet"
        }${connection.lastError ? ` · ${connection.lastError}` : ""}`}
        action={
          <>
            <StatusBadge status={connection.status} />
            <form action={testConnectionAction.bind(null, connection.id)}>
              <button type="submit" className="btn-outline min-h-10 px-4 text-[9px]">
                <RefreshCw className="size-3.5" aria-hidden />
                Test connection
              </button>
            </form>
            <form action={toggleConnectionAction.bind(null, connection.id)}>
              <button type="submit" className="btn-outline min-h-10 px-4 text-[9px]">
                <Power className="size-3.5" aria-hidden />
                {connection.enabled ? "Disable" : "Enable"}
              </button>
            </form>
            <Link href="/admin/suppliers" className="btn-outline min-h-10 px-4 text-[9px]">
              <ArrowLeft className="size-3.5" aria-hidden />
              All suppliers
            </Link>
          </>
        }
      />

      {flags.saved ? (
        <p role="status" className="border border-oxblood/25 bg-oxblood/5 px-4 py-3 text-[11px] text-oxblood">
          Connection saved.
        </p>
      ) : null}
      {flags.tested ? (
        <p
          role="status"
          className={`px-4 py-3 text-[11px] ${
            connection.status === "CONNECTED"
              ? "border border-oxblood/25 bg-oxblood/5 text-oxblood"
              : "border border-champagne-dark/30 bg-champagne/10 text-champagne-dark"
          }`}
        >
          {connection.status === "CONNECTED"
            ? "Connection test passed. You can search and import products."
            : `Connection test did not pass. ${connection.lastError ?? "Check the credentials and try again."}`}
        </p>
      ) : null}

      <SupplierForm
        action={updateConnectionAction.bind(null, connection.id)}
        values={values}
        hasCredentials={Boolean(connection.credentialsEnc)}
        submitLabel="Save connection"
      />

      {connection.provider === "CJ" ? (
        <CjImportPanel
          connectionId={connection.id}
          defaultMarkup={connection.defaultMarkupPct}
          defaultCurrency={connection.defaultCurrency}
          hasCredentials={Boolean(connection.credentialsEnc)}
        />
      ) : null}

      <section className="border border-line bg-cream">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-2xl">Linked products</h2>
          <Link href="/admin/products" className="text-[9px] uppercase tracking-[0.12em] text-oxblood hover:underline">
            All products
          </Link>
        </div>
        {connection.products.length === 0 ? (
          <p className="p-5 text-[11px] text-stone">
            No products linked yet. Import from the CJ catalogue above, or attach this
            connection from a product editor.
          </p>
        ) : (
          <div className="divide-y divide-line">
            {connection.products.map((product) => (
              <div key={product.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div>
                  <Link href={`/admin/products/${product.id}`} className="text-[12px] font-medium text-oxblood hover:underline">
                    {product.name}
                  </Link>
                  <p className="text-[9.5px] uppercase tracking-[0.08em] text-stone">
                    {product.sku} · {product.status}
                  </p>
                </div>
                <div className="flex items-center gap-6 text-[11px] text-stone">
                  <span>{formatZAR(product.price)}</span>
                  <span>{product.stock} in stock</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="border border-line bg-cream">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-2xl">Supplier promos</h2>
          <Link href="/admin/promos" className="text-[9px] uppercase tracking-[0.12em] text-oxblood hover:underline">
            All promos
          </Link>
        </div>
        {connection.promos.length === 0 ? (
          <p className="p-5 text-[11px] text-stone">
            No promos scoped to this connection. Create one with the scope
            &ldquo;Supplier&rdquo; to run a supplier-only offer.
          </p>
        ) : (
          <div className="divide-y divide-line">
            {connection.promos.map((promo) => (
              <div key={promo.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div>
                  <p className="text-[12px] font-medium">{promo.code} · {promo.label}</p>
                  <p className="text-[9.5px] text-stone">
                    {promo.type} · used {promo.usedCount}
                    {promo.maxUses ? ` of ${promo.maxUses}` : ""}
                  </p>
                </div>
                <StatusBadge status={promo.active ? "ACTIVE" : "PAUSED"} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
