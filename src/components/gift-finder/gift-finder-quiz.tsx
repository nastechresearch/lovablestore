"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";

type StepKey = "recipient" | "moment" | "budget";

const STEPS: {
  key: StepKey;
  eyebrow: string;
  question: string;
  helper: string;
  options: { value: string; label: string; note: string }[];
}[] = [
  {
    key: "recipient",
    eyebrow: "01 — The person",
    question: "Who is it for?",
    helper: "Think about how they dress, scent and carry themselves.",
    options: [
      { value: "her", label: "For her", note: "Watches, silk, scent" },
      { value: "him", label: "For him", note: "Leather, chronographs" },
      { value: "couples", label: "For couples", note: "Shared and matching" },
      { value: "everyone", label: "For anyone", note: "Universally loved" },
    ],
  },
  {
    key: "moment",
    eyebrow: "02 — The moment",
    question: "What are we celebrating?",
    helper: "The occasion shapes the weight of the gift.",
    options: [
      { value: "valentines", label: "Valentine's", note: "Love, loudly" },
      { value: "anniversary", label: "Anniversary", note: "A milestone" },
      { value: "birthday", label: "Birthday", note: "Their day" },
      { value: "any", label: "Just because", note: "No reason needed" },
    ],
  },
  {
    key: "budget",
    eyebrow: "03 — The gesture",
    question: "What feels right to spend?",
    helper: "Every price point is wrapped with the same care.",
    options: [
      { value: "under-500", label: "Under R500", note: "A small token" },
      { value: "under-1000", label: "Under R1000", note: "Considered" },
      { value: "under-1500", label: "Under R1500", note: "Something special" },
      { value: "any", label: "No limit", note: "Go all in" },
    ],
  },
];

const LABELS: Record<StepKey, Record<string, string>> = {
  recipient: { her: "For her", him: "For him", couples: "For couples", everyone: "For anyone" },
  moment: {
    valentines: "Valentine's",
    anniversary: "Anniversary",
    birthday: "Birthday",
    any: "Just because",
  },
  budget: {
    "under-500": "Under R500",
    "under-1000": "Under R1000",
    "under-1500": "Under R1500",
    any: "No limit",
  },
};

export function GiftFinderQuiz({
  initial,
  complete,
}: {
  initial: Partial<Record<StepKey, string>>;
  complete: boolean;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Partial<Record<StepKey, string>>>(initial);
  const [stepIndex, setStepIndex] = useState(() => {
    const firstUnanswered = STEPS.findIndex((step) => !initial[step.key]);
    return firstUnanswered === -1 ? STEPS.length - 1 : firstUnanswered;
  });
  const [pending, startTransition] = useTransition();

  function choose(key: StepKey, value: string) {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    const step = STEPS.findIndex((item) => item.key === key);

    if (step < STEPS.length - 1) {
      window.setTimeout(() => setStepIndex(step + 1), 180);
      return;
    }

    const params = new URLSearchParams();
    for (const item of STEPS) {
      params.set(item.key, next[item.key] ?? "any");
    }
    startTransition(() => router.push(`/gift-finder?${params.toString()}#shortlist`));
  }

  function restart() {
    setAnswers({});
    setStepIndex(0);
    startTransition(() => router.push("/gift-finder"));
  }

  if (complete) {
    return (
      <div className="border border-line bg-cream p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow flex items-center gap-2 text-champagne-dark">
              <Sparkles className="size-3.5" aria-hidden />
              Your shortlist
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl">
              Chosen for {LABELS.recipient[initial.recipient ?? ""]?.toLowerCase() ?? "them"}.
            </h2>
          </div>
          <button
            type="button"
            onClick={restart}
            className="btn-outline min-h-10 px-4 text-[9px]"
          >
            Start again
          </button>
        </div>
        <dl className="mt-6 grid gap-3 border-t border-line pt-5 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.key}>
              <dt className="text-[9px] uppercase tracking-[0.14em] text-stone">
                {step.eyebrow.slice(5)}
              </dt>
              <dd className="mt-1 font-display text-xl">
                {LABELS[step.key][initial[step.key] ?? ""] ?? "Any"}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  const step = STEPS[stepIndex];

  return (
    <div className="border border-line bg-cream p-6 sm:p-8 lg:p-10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-1.5" aria-hidden>
          {STEPS.map((item, index) => (
            <span
              key={item.key}
              className={`h-1 w-10 transition-colors ${
                index <= stepIndex ? "bg-oxblood" : "bg-line"
              }`}
            />
          ))}
        </div>
        <p className="text-[9px] uppercase tracking-[0.16em] text-stone">
          {pending ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="size-3 animate-spin" aria-hidden />
              Curating
            </span>
          ) : (
            `Step ${stepIndex + 1} of ${STEPS.length}`
          )}
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step.key}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mt-7 eyebrow text-champagne-dark">{step.eyebrow}</p>
          <h2 className="mt-3 font-display text-[clamp(2.2rem,4.5vw,3.4rem)] leading-[0.98]">
            {step.question}
          </h2>
          <p className="mt-2 max-w-md text-[12px] leading-relaxed text-stone">
            {step.helper}
          </p>

          <div className="mt-7 grid gap-2.5 sm:grid-cols-2">
            {step.options.map((option) => {
              const active = answers[step.key] === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => choose(step.key, option.value)}
                  className={`group flex items-center justify-between gap-4 border px-5 py-4 text-left transition-all duration-200 ${
                    active
                      ? "border-oxblood bg-oxblood text-ivory"
                      : "border-line bg-transparent hover:border-ink"
                  }`}
                >
                  <span>
                    <span className="block font-display text-2xl leading-none">{option.label}</span>
                    <span
                      className={`mt-1.5 block text-[10px] uppercase tracking-[0.12em] ${
                        active ? "text-ivory/65" : "text-stone"
                      }`}
                    >
                      {option.note}
                    </span>
                  </span>
                  <ArrowRight
                    className={`size-4 shrink-0 transition-transform ${
                      active
                        ? "text-ivory"
                        : "text-stone group-hover:translate-x-1 group-hover:text-oxblood"
                    }`}
                    aria-hidden
                  />
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {stepIndex > 0 ? (
        <button
          type="button"
          onClick={() => setStepIndex((value) => Math.max(0, value - 1))}
          className="mt-6 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-stone transition-colors hover:text-oxblood"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Back
        </button>
      ) : null}
    </div>
  );
}
