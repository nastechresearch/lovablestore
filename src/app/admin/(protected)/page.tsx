import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  CircleAlert,
  Package,
  Plus,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateShort, formatZAR } from "@/lib/format";
import { AdminHeading, AdminStat, StatusBadge } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [
    orderCount,
    revenue,
    pendingCount,
    productCount,
    activeProductCount,
    lowStock,
    supplierCount,
    connectedSuppliers,
    paidOrderCount,
    activePromoCount,
    tagCount,
    recentOrders,
    lowStockProducts,
    suppliers,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "paid" } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.product.count(),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.product.count({ where: { status: "ACTIVE", stock: { lte: 8 } } }),
    prisma.supplierConnection.count(),
    prisma.supplierConnection.count({ where: { enabled: true, status: "CONNECTED" } }),
    prisma.order.count({ where: { paymentStatus: "paid" } }),
    prisma.promo.count({ where: { active: true } }),
    prisma.tag.count(),
    prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE", stock: { lte: 8 } },
      orderBy: { stock: "asc" },
      take: 5,
    }),
    prisma.supplierConnection.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: [{ kind: "asc" }, { name: "asc" }],
      take: 4,
    }),
  ]);

  const collected = revenue._sum.total ?? 0;
  const average = paidOrderCount > 0 ? Math.round(collected / paidOrderCount) : 0;

  return (
    <div className="space-y-8">
      <AdminHeading
        eyebrow="Atelier desk"
        title="Good to see you."
        description="A live read on the store — orders, stock and supplier health. Everything here updates from the same database the storefront uses."
        action={
          <>
            <Link href="/admin/products/new" className="btn-primary min-h-10 px-4 text-[9px]">
              <Plus className="size-3.5" aria-hidden />
              New product
            </Link>
            <Link href="/admin/suppliers" className="btn-outline min-h-10 px-4 text-[9px]">
              <Boxes className="size-3.5" aria-hidden />
              Suppliers
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStat
          label="Paid revenue"
          value={formatZAR(collected)}
          hint={`${orderCount} orders · ${formatZAR(average)} average`}
          tone="accent"
          href="/admin/orders"
        />
        <AdminStat
          label="Awaiting action"
          value={String(pendingCount)}
          hint="Orders not yet marked paid"
          href="/admin/orders?status=PENDING"
          tone={pendingCount > 0 ? "warning" : "default"}
        />
        <AdminStat
          label="Live products"
          value={`${activeProductCount}/${productCount}`}
          hint={`${lowStock} low on stock`}
          href="/admin/products"
        />
        <AdminStat
          label="Suppliers"
          value={`${connectedSuppliers}/${supplierCount}`}
          hint={`${activePromoCount} active promos · ${tagCount} tags`}
          href="/admin/suppliers"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.5fr]">
        <section className="border border-line bg-cream">
          <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
            <h2 className="font-display text-2xl">Recent orders</h2>
            <Link href="/admin/orders" className="inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.14em] text-oxblood hover:underline">
              All orders
              <ArrowRight className="size-3" aria-hidden />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-[12px] text-stone">
              No orders yet. The storefront is ready when the first one lands.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-[12px]">
                <thead>
                  <tr className="border-b border-line text-[8.5px] uppercase tracking-[0.14em] text-stone">
                    <th className="px-5 py-3 font-medium">Order</th>
                    <th className="px-3 py-3 font-medium">Customer</th>
                    <th className="px-3 py-3 font-medium">Items</th>
                    <th className="px-3 py-3 font-medium">Total</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Placed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="transition-colors hover:bg-ivory/60">
                      <td className="px-5 py-3">
                        <Link href={`/admin/orders/${order.id}`} className="font-medium text-oxblood hover:underline">
                          {order.number}
                        </Link>
                        <p className="mt-0.5 text-[9px] uppercase tracking-[0.1em] text-stone">
                          {order.paymentProvider === "demo" ? "Demo payment" : order.paymentProvider ?? "—"}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <p>{order.firstName} {order.lastName}</p>
                        <p className="text-[10px] text-stone">{order.city}, {order.province}</p>
                      </td>
                      <td className="px-3 py-3 text-stone">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                      <td className="px-3 py-3 font-medium">{formatZAR(order.total)}</td>
                      <td className="px-3 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-3 text-stone">{formatDateShort(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="space-y-6">
          <section className="border border-line bg-cream">
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <h2 className="flex items-center gap-2 font-display text-xl">
                <CircleAlert className="size-4 text-champagne-dark" aria-hidden />
                Low stock
              </h2>
              <Link href="/admin/products" className="text-[9px] uppercase tracking-[0.12em] text-oxblood hover:underline">
                Manage
              </Link>
            </div>
            {lowStockProducts.length === 0 ? (
              <p className="p-5 text-[11px] text-stone">Everything is comfortably stocked.</p>
            ) : (
              <ul className="divide-y divide-line">
                {lowStockProducts.map((product) => (
                  <li key={product.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <Link href={`/admin/products/${product.id}`} className="block truncate text-[12px] hover:text-oxblood">
                        {product.name}
                      </Link>
                      <p className="text-[9px] uppercase tracking-[0.1em] text-stone">{product.sku}</p>
                    </div>
                    <span className={`shrink-0 text-[11px] tabular-nums ${product.stock === 0 ? "text-oxblood" : "text-ink"}`}>
                      {product.stock} left
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="border border-line bg-cream">
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <h2 className="flex items-center gap-2 font-display text-xl">
                <Sparkles className="size-4 text-champagne-dark" aria-hidden />
                Supplier health
              </h2>
              <Link href="/admin/suppliers" className="text-[9px] uppercase tracking-[0.12em] text-oxblood hover:underline">
                All
              </Link>
            </div>
            <ul className="divide-y divide-line">
              {suppliers.map((supplier) => (
                <li key={supplier.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <Link href={`/admin/suppliers/${supplier.id}`} className="block truncate text-[12px] hover:text-oxblood">
                      {supplier.name}
                    </Link>
                    <p className="text-[9px] uppercase tracking-[0.1em] text-stone">
                      {supplier.kind} · {supplier._count.products} products
                    </p>
                  </div>
                  <StatusBadge status={supplier.status} />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { href: "/admin/products/new", label: "Add a product", icon: Package, copy: "Create with auto image, SKU and barcode." },
          { href: "/admin/promos/new", label: "Launch a promo", icon: Sparkles, copy: "Local, tag or supplier-scoped codes." },
          { href: "/admin/orders?status=PAID", label: "Fulfil orders", icon: ShoppingBag, copy: "Pack, courier and track paid orders." },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex items-start gap-3 border border-line bg-cream p-5 transition-colors hover:border-champagne"
          >
            <card.icon className="mt-0.5 size-4 text-champagne-dark" aria-hidden />
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.1em] group-hover:text-oxblood">{card.label}</p>
              <p className="mt-1 text-[10px] leading-relaxed text-stone">{card.copy}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
