import Link from "next/link";
import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { formatDateShort, formatZAR } from "@/lib/format";
import { ORDER_STATUSES, STATUS_LABELS } from "@/lib/constants";
import { AdminHeading, EmptyState, StatusBadge } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ status?: string; q?: string }>;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const status = params.status && ORDER_STATUSES.includes(params.status as (typeof ORDER_STATUSES)[number])
    ? params.status
    : "";
  const q = params.q?.trim() ?? "";

  const where: Prisma.OrderWhereInput = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { number: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { trackingNumber: { contains: q, mode: "insensitive" } },
    ];
  }

  const [orders, groups, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.count(),
  ]);

  const countFor = (value: string) =>
    groups.find((group) => group.status === value)?._count._all ?? 0;

  return (
    <div className="space-y-6">
      <AdminHeading
        eyebrow="Fulfilment"
        title="Orders"
        description="Every order from checkout to courier. Update payment status, add tracking and manage supplier fulfilment."
        action={
          <form method="get" className="flex gap-2">
            {status ? <input type="hidden" name="status" value={status} /> : null}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-stone" aria-hidden />
              <input
                name="q"
                defaultValue={q}
                placeholder="Order, name, email…"
                className="field min-h-10 w-56 py-1.5 pl-9 text-[11px]"
              />
            </div>
            <button type="submit" className="btn-outline min-h-10 px-4 text-[9px]">Search</button>
          </form>
        }
      />

      <div className="flex flex-wrap gap-1.5">
        <Link
          href="/admin/orders"
          className={`inline-flex min-h-9 items-center gap-2 border px-3 text-[9px] uppercase tracking-[0.12em] transition-colors ${
            !status ? "border-ink bg-ink text-ivory" : "border-line bg-cream text-stone hover:border-ink"
          }`}
        >
          All
          <span className="opacity-60">{total}</span>
        </Link>
        {ORDER_STATUSES.map((value) => (
          <Link
            key={value}
            href={`/admin/orders?status=${value}`}
            className={`inline-flex min-h-9 items-center gap-2 border px-3 text-[9px] uppercase tracking-[0.12em] transition-colors ${
              status === value ? "border-ink bg-ink text-ivory" : "border-line bg-cream text-stone hover:border-ink"
            }`}
          >
            {STATUS_LABELS[value]}
            <span className="opacity-60">{countFor(value)}</span>
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="No orders here yet."
          copy={q ? "Nothing matches that search. Try another name or order number." : "Orders will appear here as soon as customers check out."}
          action={<Link href="/shop" className="btn-outline min-h-10 px-4 text-[9px]">View storefront</Link>}
        />
      ) : (
        <div className="overflow-x-auto border border-line bg-cream">
          <table className="w-full min-w-[860px] text-left text-[12px]">
            <thead>
              <tr className="border-b border-line text-[8.5px] uppercase tracking-[0.14em] text-stone">
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-3 py-3 font-medium">Customer</th>
                <th className="px-3 py-3 font-medium">Delivery</th>
                <th className="px-3 py-3 font-medium">Items</th>
                <th className="px-3 py-3 font-medium">Total</th>
                <th className="px-3 py-3 font-medium">Payment</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-ivory/60">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-medium text-oxblood hover:underline">
                      {order.number}
                    </Link>
                    {order.trackingNumber ? (
                      <p className="mt-0.5 text-[9px] text-stone">{order.courier} · {order.trackingNumber}</p>
                    ) : null}
                  </td>
                  <td className="px-3 py-3">
                    <p>{order.firstName} {order.lastName}</p>
                    <p className="text-[10px] text-stone">{order.email}</p>
                  </td>
                  <td className="px-3 py-3 text-[11px] text-stone">
                    {order.city}<br />{order.province}
                  </td>
                  <td className="px-3 py-3 text-stone">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </td>
                  <td className="px-3 py-3 font-medium">{formatZAR(order.total)}</td>
                  <td className="px-3 py-3">
                    <StatusBadge status={order.paymentStatus} />
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-[11px] text-stone">{formatDateShort(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[10px] text-stone">
        Showing up to 100 most recent orders. Revenue and demo flags are visible on
        each order.
      </p>
    </div>
  );
}
