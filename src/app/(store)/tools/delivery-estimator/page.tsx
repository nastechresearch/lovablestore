import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Globe2,
  MapPin,
  PackageCheck,
  Plane,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { DeliveryEstimator } from "@/components/tools/delivery-estimator";
import { getStoreSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Delivery estimator",
  description:
    "Estimate when your Lovable Store order will arrive. Real business-day windows, dispatch cutoff and South African public-holiday policy for local and imported pieces.",
};

type Holiday = {
  date: string;
  label: string;
  name: string;
};

const HOLIDAYS_2026: Holiday[] = [
  { date: "2026-01-01", label: "Thu 1 Jan", name: "New Year's Day" },
  { date: "2026-03-21", label: "Sat 21 Mar", name: "Human Rights Day" },
  { date: "2026-04-03", label: "Fri 3 Apr", name: "Good Friday" },
  { date: "2026-04-06", label: "Mon 6 Apr", name: "Family Day" },
  { date: "2026-04-27", label: "Mon 27 Apr", name: "Freedom Day" },
  { date: "2026-05-01", label: "Fri 1 May", name: "Workers' Day" },
  { date: "2026-06-16", label: "Tue 16 Jun", name: "Youth Day" },
  { date: "2026-08-09", label: "Sun 9 Aug", name: "Women's Day" },
  {
    date: "2026-08-10",
    label: "Mon 10 Aug",
    name: "Women's Day (observed)",
  },
  { date: "2026-09-24", label: "Thu 24 Sep", name: "Heritage Day" },
  {
    date: "2026-12-16",
    label: "Wed 16 Dec",
    name: "Day of Reconciliation",
  },
  { date: "2026-12-25", label: "Fri 25 Dec", name: "Christmas Day" },
  { date: "2026-12-26", label: "Sat 26 Dec", name: "Day of Goodwill" },
];

const HOLIDAYS_2027: Holiday[] = [
  { date: "2027-01-01", label: "Fri 1 Jan", name: "New Year's Day" },
  { date: "2027-03-21", label: "Sun 21 Mar", name: "Human Rights Day" },
  {
    date: "2027-03-22",
    label: "Mon 22 Mar",
    name: "Human Rights Day (observed)",
  },
  { date: "2027-03-26", label: "Fri 26 Mar", name: "Good Friday" },
  { date: "2027-03-29", label: "Mon 29 Mar", name: "Family Day" },
  { date: "2027-04-27", label: "Tue 27 Apr", name: "Freedom Day" },
  { date: "2027-05-01", label: "Sat 1 May", name: "Workers' Day" },
  { date: "2027-06-16", label: "Wed 16 Jun", name: "Youth Day" },
  { date: "2027-08-09", label: "Mon 9 Aug", name: "Women's Day" },
  { date: "2027-09-24", label: "Fri 24 Sep", name: "Heritage Day" },
  {
    date: "2027-12-16",
    label: "Thu 16 Dec",
    name: "Day of Reconciliation",
  },
  { date: "2027-12-25", label: "Sat 25 Dec", name: "Christmas Day" },
  { date: "2027-12-26", label: "Sun 26 Dec", name: "Day of Goodwill" },
  {
    date: "2027-12-27",
    label: "Mon 27 Dec",
    name: "Day of Goodwill (observed)",
  },
];

function HolidayColumn({ year, holidays }: { year: string; holidays: Holiday[] }) {
  return (
    <div className="px-5 py-5 sm:px-6">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-champagne-dark">
          {year}
        </p>
        <p className="text-[9px] uppercase tracking-[0.12em] text-stone">
          {holidays.length} dates
        </p>
      </div>
      <ul className="mt-3 divide-y divide-line/70">
        {holidays.map((holiday) => (
          <li
            key={holiday.date}
            className="flex items-baseline justify-between gap-4 py-2"
          >
            <time
              dateTime={holiday.date}
              className="shrink-0 text-[10px] uppercase tracking-[0.08em] text-stone"
            >
              {holiday.label}
            </time>
            <span className="text-right text-[11px] leading-snug">
              {holiday.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function DeliveryEstimatorPage() {
  const settings = await getStoreSettings();
  const cutoff = `${String(settings.dispatchCutoffHour).padStart(2, "0")}:00`;
  const localWindow = `${settings.localLeadMin}–${settings.localLeadMax}`;
  const globalWindow = `${settings.globalLeadMin}–${settings.globalLeadMax}`;

  return (
    <>
      <section className="border-b border-line bg-cream">
        <div className="container-lux py-10 sm:py-14">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-stone"
          >
            <Link href="/tools" className="transition-colors hover:text-oxblood">
              Tools
            </Link>
            <span aria-hidden>/</span>
            <span className="text-ink">Delivery estimator</span>
          </nav>

          <div className="mt-6 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="eyebrow text-champagne-dark">Tool · Delivery</p>
              <h1 className="mt-4 font-display text-[clamp(2.9rem,6.5vw,5.2rem)] leading-[0.94]">
                Know when it
                <br />
                <span className="italic text-oxblood">lands.</span>
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-relaxed text-stone">
                A real business-day estimate, built from the same dispatch
                engine as checkout. Choose the parcel, the province and the day
                you pay — we&apos;ll show the earliest and latest arrival.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="grid-badge">
                  <Clock3 className="size-3 text-champagne-dark" aria-hidden />
                  Cutoff {cutoff} SAST
                </span>
                <span className="grid-badge">
                  <PackageCheck
                    className="size-3 text-champagne-dark"
                    aria-hidden
                  />
                  Local {localWindow} business days
                </span>
                <span className="grid-badge">
                  <Globe2
                    className="size-3 text-champagne-dark"
                    aria-hidden
                  />
                  Global {globalWindow} business days
                </span>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#estimator" className="btn-primary">
                  Build my window
                  <ArrowRight className="size-4" aria-hidden />
                </a>
                <Link href="/delivery-and-returns" className="btn-outline">
                  Delivery policy
                </Link>
              </div>
            </div>

            <div className="surface-card surface-grid p-5 sm:p-6">
              <p className="eyebrow text-champagne-dark">
                How the window is built
              </p>
              <ul className="mt-4 divide-y divide-line">
                <li className="flex gap-3 py-4 first:pt-0">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-champagne/50 bg-champagne/10 text-champagne-dark">
                    <Clock3 className="size-4" aria-hidden />
                  </span>
                  <div>
                    <p className="text-[12px] font-medium">The dispatch cutoff</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-stone">
                      Paid or cleared before {cutoff} SAST on a business day, we
                      pack the same day. After {cutoff}, or on a weekend or
                      public holiday, dispatch moves to the next business day.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3 py-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-champagne/50 bg-champagne/10 text-champagne-dark">
                    <CalendarDays className="size-4" aria-hidden />
                  </span>
                  <div>
                    <p className="text-[12px] font-medium">
                      Business days, not calendar days
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-stone">
                      Monday to Friday, excluding South African public holidays.
                      Metro couriers may deliver on Saturdays, but Saturdays and
                      Sundays never count toward the transit window.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3 py-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-champagne/50 bg-champagne/10 text-champagne-dark">
                    <Plane className="size-4" aria-hidden />
                  </span>
                  <div>
                    <p className="text-[12px] font-medium">
                      Local stock vs. imported
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-stone">
                      Local pieces ship from Johannesburg in {localWindow}{" "}
                      business days with no customs. Global atelier pieces take{" "}
                      {globalWindow} business days and include the flight,
                      customs clearance and last-mile courier. A mixed bag can
                      arrive as two tracked parcels.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3 py-4 last:pb-0">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-champagne/50 bg-champagne/10 text-champagne-dark">
                    <MapPin className="size-4" aria-hidden />
                  </span>
                  <div>
                    <p className="text-[12px] font-medium">
                      Nine provinces, metro routing
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-stone">
                      We deliver to all nine provinces. Metro addresses follow
                      the estimate below; outlying towns, farms and smallholdings
                      can add a business day once the courier routes the parcel.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section
        id="estimator"
        className="container-lux scroll-mt-24 py-10 sm:py-14"
      >
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-champagne-dark">The estimator</p>
            <h2 className="mt-2 font-display text-[clamp(2rem,4.5vw,3.2rem)] leading-[1]">
              Build your <span className="italic text-oxblood">window.</span>
            </h2>
          </div>
          <p className="max-w-sm text-[11px] leading-relaxed text-stone">
            This is a calculated estimate, not a live courier quote. Couriers
            confirm collection and tracking when the parcel is scanned.
          </p>
        </div>

        <DeliveryEstimator
          settings={{
            dispatchCutoffHour: settings.dispatchCutoffHour,
            localLeadMin: settings.localLeadMin,
            localLeadMax: settings.localLeadMax,
            globalLeadMin: settings.globalLeadMin,
            globalLeadMax: settings.globalLeadMax,
          }}
        />
      </section>

      <section className="border-y border-line bg-cream">
        <div className="container-lux py-10 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="eyebrow text-champagne-dark">The honest fine print</p>
              <h2 className="mt-2 font-display text-[clamp(2.1rem,4.5vw,3.4rem)] leading-[1]">
                A good estimate,
                <br />
                <span className="italic text-oxblood">not a promise.</span>
              </h2>
              <p className="mt-4 max-w-md text-[12px] leading-relaxed text-stone">
                Our window is deliberately conservative. It uses the real
                dispatch calendar and lead times — but it does not pretend to
                know a courier&apos;s live capacity, route or traffic on the day.
              </p>

              <ul className="mt-6 space-y-4">
                <li className="flex gap-3">
                  <ShieldCheck
                    className="mt-0.5 size-4 shrink-0 text-champagne-dark"
                    aria-hidden
                  />
                  <p className="text-[11px] leading-relaxed text-stone">
                    <span className="font-medium text-ink">
                      No live courier feed.
                    </span>{" "}
                    We don&apos;t request address-level quotes or tracking from a
                    courier API on this page. The window is calculated from our
                    own dispatch rules.
                  </p>
                </li>
                <li className="flex gap-3">
                  <Truck
                    className="mt-0.5 size-4 shrink-0 text-champagne-dark"
                    aria-hidden
                  />
                  <p className="text-[11px] leading-relaxed text-stone">
                    <span className="font-medium text-ink">
                      Confirmed at dispatch.
                    </span>{" "}
                    Once packed, you receive a tracking number by email and SMS.
                    Track it any time on the{" "}
                    <Link
                      href="/track"
                      className="text-oxblood underline underline-offset-2"
                    >
                      tracking page
                    </Link>
                    .
                  </p>
                </li>
                <li className="flex gap-3">
                  <CalendarDays
                    className="mt-0.5 size-4 shrink-0 text-champagne-dark"
                    aria-hidden
                  />
                  <p className="text-[11px] leading-relaxed text-stone">
                    <span className="font-medium text-ink">
                      Holidays are policy, not live data.
                    </span>{" "}
                    Dates below follow the Public Holidays Act as observed.
                    Additional days proclaimed by government, election days and
                    courier disruptions are not included.
                  </p>
                </li>
              </ul>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href="/delivery-and-returns" className="btn-outline">
                  Delivery &amp; returns
                </Link>
                <Link href="/track" className="btn-quiet">
                  Track an order
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </div>
            </div>

            <div className="surface-card">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
                <div>
                  <p className="eyebrow text-champagne-dark">
                    Public holidays
                  </p>
                  <h3 className="mt-1 font-display text-2xl">2026–2027</h3>
                </div>
                <span className="grid-badge">
                  <CalendarDays
                    className="size-3 text-champagne-dark"
                    aria-hidden
                  />
                  Excluded from business days
                </span>
              </div>

              <div className="grid sm:grid-cols-2">
                <HolidayColumn year="2026" holidays={HOLIDAYS_2026} />
                <div className="border-t border-line sm:border-l sm:border-t-0">
                  <HolidayColumn year="2027" holidays={HOLIDAYS_2027} />
                </div>
              </div>

              <p className="border-t border-line px-5 py-4 text-[10px] leading-relaxed text-stone sm:px-6">
                When a public holiday falls on a Sunday, the following Monday is
                observed and shown above. The engine skips these dates when
                counting business days. Government-proclaimed once-off holidays
                may be added during the year and would shift the estimate.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-stone transition-colors hover:text-oxblood"
            >
              <ArrowRight className="size-3.5 rotate-180" aria-hidden />
              All tools
            </Link>
            <p className="text-[10px] text-stone">
              Questions about a specific address?{" "}
              <Link
                href="/contact"
                className="text-oxblood underline underline-offset-2"
              >
                Talk to the studio
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
