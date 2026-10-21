import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Fingerprint, Heart, Package, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatDate, formatZAR } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/constants";
import { needsPlainImage } from "@/lib/products";
import { ProfileForm } from "@/components/account/profile-form";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ welcome?: string; signedin?: string }>;

export default async function AccountOverviewPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireUser("/account");
  const params = await searchParams;

  const [orders, wishlistCount, passkeys, sessions] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.wishlistItem.count({ where: { userId: user.id } }),
    prisma.passkey.count({ where: { userId: user.id } }),
    prisma.session.count({ where: { userId: user.id } }),
  ]);

  const orderCount = await prisma.order.count({ where: { userId: user.id } });
  const recent = orders.slice(0, 3);
  const stats = [
    { label: "Orders placed", value: orderCount, icon: Package, href: "/account/orders" },
    { label: "Saved pieces", value: wishlistCount, icon: Heart, href: "/account/wishlist" },
    { label: "Passkeys", value: passkeys, icon: Fingerprint, href: "/account/security" },
    { label: "Active devices", value: sessions, icon: Sparkles, href: "/account/security" },
  ];

  return (
    <div className="space-y-8">
      {params.welcome ? (
        <div className="border border-oxblood/25 bg-oxblood/5 p-4">
          <p className="font-display text-xl text-oxblood">Welcome to the house.</p>
          <p className="mt-1 text-[11px] leading-relaxed text-stone">
            Your account is ready. Save pieces, add a passkey and check out faster next time.
          </p>
        </div>
      ) : params.signedin ? (
        <div className="border border-oxblood/25 bg-oxblood/5 p-4">
          <p className="font-display text-xl text-oxblood">You&rsquo;re signed in.</p>
          <p className="mt-1 text-[11px] leading-relaxed text-stone">
            Your orders and saved pieces are below. This device stays signed in for 30 days.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group border border-line bg-cream p-4 transition-colors hover:border-oxblood/40"
          >
            <div className="flex items-center justify-between">
              <stat.icon className="size-4 text-oxblood" aria-hidden />
              <ArrowRight className="size-3.5 -translate-x-1 text-stone opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" aria-hidden />
            </div>
            <p className="mt-4 font-display text-3xl leading-none">{stat.value}</p>
            <p className="mt-1.5 text-[9px] uppercase tracking-[0.12em] text-stone">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <ProfileForm
          firstName={user.firstName}
          lastName={user.lastName}
          phone={user.phone ?? ""}
          email={user.email}
        />

        <section className="border border-line bg-cream p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-2xl">Recent orders</h2>
            <Link
              href="/account/orders"
              className="text-[9px] uppercase tracking-[0.12em] text-stone hover:text-oxblood"
            >
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="mt-4 border border-dashed border-line p-5 text-center">
              <Package className="mx-auto size-6 text-stone" aria-hidden />
              <p className="mt-3 font-display text-xl">No orders yet.</p>
              <p className="mt-1 text-[11px] text-stone">
                When you place an order it will appear here with tracking.
              </p>
              <Link href="/shop" className="btn-outline mt-4">
                Start shopping
              </Link>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {recent.map((order) => (
                <li key={order.id} className="py-3.5 first:pt-0 last:pb-0">
                  <Link
                    href={`/order/${order.number}?email=${encodeURIComponent(order.email)}`}
                    className="group flex items-center gap-3"
                  >
                    <span className="relative size-14 shrink-0 overflow-hidden border border-line bg-ivory-deep">
                      {order.items[0] ? (
                        <Image
                          src={order.items[0].image || "/images/editorial/hero-gifts.jpg"}
                          alt=""
                          fill
                          sizes="56px"
                          unoptimized={needsPlainImage(order.items[0].image)}
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-[11px] font-medium text-ink">
                          {order.number}
                        </span>
                        <span className="text-[10px] text-stone">{formatZAR(order.total)}</span>
                      </span>
                      <span className="mt-0.5 block text-[9.5px] text-stone">
                        {formatDate(order.createdAt)} · {order.items.length} item
                        {order.items.length === 1 ? "" : "s"}
                      </span>
                      <span className="mt-1 inline-block border border-line bg-ivory-deep/40 px-1.5 py-0.5 text-[8.5px] uppercase tracking-[0.1em] text-stone">
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <Link
          href="/account/security"
          className="group border border-line bg-cream p-4 transition-colors hover:border-oxblood/40"
        >
          <Fingerprint className="size-4 text-oxblood" aria-hidden />
          <p className="mt-4 font-display text-xl">Add a passkey</p>
          <p className="mt-1 text-[10px] leading-relaxed text-stone">
            Use Face ID or your fingerprint instead of a password.
          </p>
        </Link>
        <Link
          href="/account/wishlist"
          className="group border border-line bg-cream p-4 transition-colors hover:border-oxblood/40"
        >
          <Heart className="size-4 text-oxblood" aria-hidden />
          <p className="mt-4 font-display text-xl">Your saved pieces</p>
          <p className="mt-1 text-[10px] leading-relaxed text-stone">
            Keep gifting ideas together until payday.
          </p>
        </Link>
        <Link
          href="/moments"
          className="group border border-line bg-cream p-4 transition-colors hover:border-oxblood/40"
        >
          <Sparkles className="size-4 text-oxblood" aria-hidden />
          <p className="mt-4 font-display text-xl">Mzansi moments</p>
          <p className="mt-1 text-[10px] leading-relaxed text-stone">
            The South African calendar, with a gift edit for each day.
          </p>
        </Link>
      </section>
    </div>
  );
}
