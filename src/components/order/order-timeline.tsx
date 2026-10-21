import { Check, Clock } from "lucide-react";
import { ORDER_STATUSES, STATUS_LABELS } from "@/lib/constants";

const STEPS = ORDER_STATUSES.filter((status) => status !== "CANCELLED");

export function OrderTimeline({ status }: { status: string }) {
  if (status === "CANCELLED") {
    return (
      <div className="border border-oxblood/30 bg-oxblood/5 p-4 text-[12px] text-oxblood">
        This order was cancelled. Any payment taken is refunded within 5–10
        business days — reply to your confirmation email if you need help.
      </div>
    );
  }

  const current = Math.max(0, STEPS.indexOf(status as (typeof STEPS)[number]));

  return (
    <ol className="grid gap-3 sm:grid-cols-5">
      {STEPS.map((step, index) => {
        const done = index <= current;
        const active = index === current;
        return (
          <li key={step} className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2">
            <div className="flex items-center sm:w-full">
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                  done
                    ? "border-oxblood bg-oxblood text-ivory"
                    : "border-line bg-cream text-stone"
                }`}
              >
                {done ? <Check className="size-3.5" aria-hidden /> : index + 1}
              </span>
              {index < STEPS.length - 1 ? (
                <span
                  className={`ml-2 hidden h-px flex-1 sm:block ${
                    index < current ? "bg-oxblood" : "bg-line"
                  }`}
                  aria-hidden
                />
              ) : null}
            </div>
            <div>
              <p
                className={`text-[10px] uppercase tracking-[0.12em] ${
                  active ? "text-oxblood" : done ? "text-ink" : "text-stone"
                }`}
              >
                {STATUS_LABELS[step] ?? step}
              </p>
              {active ? (
                <p className="mt-0.5 flex items-center gap-1 text-[9px] text-stone">
                  <Clock className="size-2.5" aria-hidden />
                  Current stage
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
