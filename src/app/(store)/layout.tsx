import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { WhatsAppFab } from "@/components/layout/whatsapp-fab";
import { InstallApp } from "@/components/pwa/install-app";
import { SupportWidget } from "@/components/support/support-widget";
import { Providers } from "@/components/providers";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <a
        href="#main-content"
        className="sr-only z-[100] bg-oxblood px-4 py-3 text-sm text-ivory focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <div className="flex min-h-screen flex-col">
        <AnnouncementBar />
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <WhatsAppFab />
        <SupportWidget />
        <MobileTabBar />
        <InstallApp />
      </div>
    </Providers>
  );
}
