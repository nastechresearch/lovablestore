import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { logoutAction } from "@/actions/admin-auth";
import { AdminMobileNav, AdminNav, AdminSidebarMark } from "@/components/admin/admin-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-ivory lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside
        data-print-hide
        className="night-panel sticky top-0 hidden h-screen flex-col lg:flex"
      >
        <AdminSidebarMark />
        <div className="flex-1">
          <AdminNav />
        </div>
        <div className="border-t border-ivory/10 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[9px] uppercase tracking-[0.16em] text-ivory/60">Theme</p>
            <ThemeToggle />
          </div>
          <p className="text-[9px] uppercase tracking-[0.16em] text-ivory/60">
            Signed in as
          </p>
          <p className="mt-1 text-[11px] text-ivory/80">Studio admin</p>
          <form action={logoutAction} className="mt-3">
            <button
              type="submit"
              className="w-full border border-ivory/25 px-3 py-2 text-left text-[9px] uppercase tracking-[0.14em] text-ivory/75 transition-colors hover:border-ivory/60 hover:text-ivory"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <div className="night-panel lg:hidden" data-print-hide>
          <div className="flex items-center justify-between px-4 pt-4">
            <Link href="/admin" className="font-display text-2xl text-ivory">
              Lovable Store
            </Link>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <form action={logoutAction}>
                <button type="submit" className="text-[9px] uppercase tracking-[0.14em] text-ivory/70">
                  Sign out
                </button>
              </form>
            </div>
          </div>
          <AdminMobileNav />
        </div>

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
