import {
  CourierVan,
  GiftRibbon,
  Plane,
  ShieldCheck,
} from "@/components/icons/atelier-icons";
import { Reveal } from "@/components/motion/reveal";

const PROMISES = [
  {
    icon: CourierVan,
    title: "Nationwide, tracked",
    copy: "2–5 days from our local partners. Global finds show their own timeline upfront.",
  },
  {
    icon: GiftRibbon,
    title: "Wrapped, not just packed",
    copy: "Signature wrap, ribbon and a handwritten note on every single order.",
  },
  {
    icon: ShieldCheck,
    title: "Secure, local checkout",
    copy: "PayFast card and EFT. Every price in rand, with no surprise duties.",
  },
  {
    icon: Plane,
    title: "Two sources, one standard",
    copy: "Local stock where it matters, vetted global partners for the rare find.",
  },
];

export function Promises() {
  return (
    <Reveal>
      <div className="grid gap-0 border-y border-line sm:grid-cols-2 lg:grid-cols-4">
        {PROMISES.map((promise, index) => {
          const Icon = promise.icon;
          return (
            <div
              key={promise.title}
              className={`flex gap-4 px-0 py-6 sm:px-6 lg:px-7 ${
                index > 0 ? "border-t border-line sm:border-t-0" : ""
              } ${index > 0 ? "sm:border-l sm:border-line" : ""} ${
                index === 2 ? "sm:border-l-0 lg:border-l" : ""
              }`}
            >
              <Icon
                className="mt-0.5 size-5 shrink-0 text-champagne-dark"
                aria-hidden
              />
              <div>
                <h3 className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em]">
                  {promise.title}
                </h3>
                <p className="mt-2 text-[11px] leading-relaxed text-stone">
                  {promise.copy}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Reveal>
  );
}
