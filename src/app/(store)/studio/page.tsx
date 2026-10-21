import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Ruler, Scissors, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { CustomStudio } from "@/components/studio/custom-studio";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The custom atelier",
  description:
    "Design a tee, hoodie, shirt, dress, cap or tote in your colour. Request a quote from a vetted South African or global maker.",
};

const STEPS = [
  { title: "Design it", copy: "Choose the blank, colour, size and finish. Watch it update live." },
  { title: "We quote", copy: "The studio confirms fabric, maker and a final quote in 1–2 business days." },
  { title: "Approve", copy: "You get a digital mock-up and sample timeline before production." },
  { title: "Made & delivered", copy: "Your run is checked, wrapped and couriered nationwide." },
];

export default async function StudioPage() {
  const [user, connections] = await Promise.all([
    getCurrentUser(),
    prisma.supplierConnection.findMany({
      where: { enabled: true },
      orderBy: [{ kind: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        kind: true,
        defaultShipsFrom: true,
        defaultLeadMin: true,
        defaultLeadMax: true,
      },
    }),
  ]);

  const makers = connections.map((connection) => ({
    id: connection.id,
    name: connection.name,
    kind: connection.kind,
    shipsFrom: connection.defaultShipsFrom,
    leadMin: connection.defaultLeadMin,
    leadMax: connection.defaultLeadMax,
  }));

  return (
    <div>
      <section className="night-panel text-ivory">
        <div className="container-lux py-14 sm:py-18 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-champagne">
                <Scissors className="size-3.5" aria-hidden />
                The custom atelier
              </p>
              <h1 className="mt-4 max-w-3xl font-display text-[2.8rem] leading-[1.02] sm:text-[3.7rem] lg:text-[4.3rem]">
                Your idea, in your
                <span className="italic text-champagne"> colour</span>.
              </h1>
              <p className="mt-5 max-w-xl text-[12px] leading-relaxed text-ivory/65">
                A monogram for the wedding party. Staff shirts for the studio. A one-off dress in
                the exact shade you have been picturing. Pick a blank, design it live, and we will
                match you with a vetted maker and a clear quote.
              </p>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[9px] uppercase tracking-[0.14em] text-ivory/50">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="size-3 text-champagne" aria-hidden />
                  No payment to request
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="size-3 text-champagne" aria-hidden />
                  Local &amp; global makers
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="size-3 text-champagne" aria-hidden />
                  Sample before full run
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-px overflow-hidden border border-ivory/15 bg-ivory/10">
              {STEPS.map((step, index) => (
                <div key={step.title} className="bg-ink p-4">
                  <span className="text-[8px] uppercase tracking-[0.16em] text-champagne">
                    0{index + 1}
                  </span>
                  <p className="mt-2 font-display text-lg">{step.title}</p>
                  <p className="mt-1 text-[9.5px] leading-relaxed text-ivory/55">{step.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-lux py-10 sm:py-14">
        <CustomStudio
          makers={makers}
          signedIn={Boolean(user)}
          viewerName={user ? `${user.firstName} ${user.lastName}`.trim() : ""}
          viewerEmail={user?.email ?? ""}
        />
      </section>

      <section className="container-lux pb-16 sm:pb-20">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="border border-line bg-cream p-5">
            <Ruler className="size-4 text-oxblood" aria-hidden />
            <p className="mt-3 font-display text-xl">Sizing help</p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-stone">
              Send chest, waist and length measurements in your notes. We will confirm the closest
              block or arrange a custom pattern.
            </p>
          </div>
          <div className="border border-line bg-cream p-5">
            <Sparkles className="size-4 text-oxblood" aria-hidden />
            <p className="mt-3 font-display text-xl">Small runs welcome</p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-stone">
              One monogrammed gift or a 150-piece team order. Minimums and per-unit pricing are
              confirmed in the quote.
            </p>
          </div>
          <div className="border border-line bg-cream p-5">
            <Scissors className="size-4 text-oxblood" aria-hidden />
            <p className="mt-3 font-display text-xl">Need a hand?</p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-stone">
              Use the concierge chat for fabric questions, or{" "}
              <Link href="/contact" className="text-oxblood underline underline-offset-2">
                contact the studio
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="container-lux pb-16">
        <div className="flex flex-wrap items-center justify-between gap-4 border border-line bg-ivory-deep/30 p-6">
          <div>
            <p className="eyebrow text-champagne-dark">Prefer something ready-made?</p>
            <p className="mt-2 font-display text-2xl">The full house is a click away.</p>
          </div>
          <Link href="/shop" className="btn-outline">
            Shop all pieces
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}
