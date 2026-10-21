"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  PointerEvent as ReactPointerEvent,
  RefObject,
} from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import {
  ArrowRight,
  Check,
  CreditCard,
  Loader2,
  LockKeyhole,
  Nfc,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Wifi,
} from "lucide-react";
import {
  CARD_BRANDS,
  DEMO_CARD,
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  validateCard,
  type CardBrandId,
  type CardErrors,
} from "@/lib/card";
import { formatZAR } from "@/lib/format";

const SKINS: Record<
  CardBrandId,
  { gradient: string; accent: string; rule: string; label: string }
> = {
  visa: {
    gradient: "linear-gradient(135deg,#080f24 0%,#14295c 46%,#070b18 100%)",
    accent: "#c9d8ff",
    rule: "rgba(160,190,255,0.28)",
    label: "Visa",
  },
  mastercard: {
    gradient: "linear-gradient(135deg,#180a0d 0%,#4a1622 46%,#140709 100%)",
    accent: "#f3d2b6",
    rule: "rgba(255,170,150,0.26)",
    label: "Mastercard",
  },
  amex: {
    gradient: "linear-gradient(135deg,#041b1a 0%,#0d4641 46%,#041413 100%)",
    accent: "#c3eadf",
    rule: "rgba(150,235,215,0.24)",
    label: "American Express",
  },
  discover: {
    gradient: "linear-gradient(135deg,#170f06 0%,#4d2e0f 48%,#140c04 100%)",
    accent: "#ffd9a3",
    rule: "rgba(255,200,130,0.26)",
    label: "Discover",
  },
  unknown: {
    gradient: "linear-gradient(135deg,#12100e 0%,#2e2118 46%,#0d0b09 100%)",
    accent: "#ecdcc0",
    rule: "rgba(214,185,133,0.26)",
    label: "Lovable Store",
  },
};

function BrandMark({ brand, small = false }: { brand: CardBrandId; small?: boolean }) {
  if (brand === "visa") {
    return (
      <span
        className={`font-display font-semibold italic tracking-[-0.04em] text-white ${small ? "text-sm" : "text-2xl"}`}
      >
        VISA
      </span>
    );
  }
  if (brand === "mastercard") {
    return (
      <span className="flex items-center gap-1.5" aria-label="Mastercard">
        <span className="relative flex items-center">
          <span className={`rounded-full bg-[#eb001b] ${small ? "size-3.5" : "size-5"}`} />
          <span className={`-ml-1.5 rounded-full bg-[#f79e1b] mix-blend-screen ${small ? "size-3.5" : "size-5"}`} />
        </span>
        {!small ? (
          <span className="text-[8px] uppercase tracking-[0.16em] text-white/75">Mastercard</span>
        ) : null}
      </span>
    );
  }
  if (brand === "amex") {
    return (
      <span
        className={`border border-white/60 px-1.5 py-0.5 font-sans font-bold leading-none tracking-[0.06em] text-white ${small ? "text-[8px]" : "text-[11px]"}`}
      >
        AMEX
      </span>
    );
  }
  if (brand === "discover") {
    return (
      <span className="flex items-center gap-1">
        <span className={`rounded-full bg-[#f58220] ${small ? "size-2.5" : "size-3"}`} />
        <span className={`font-medium uppercase tracking-[0.18em] text-white/85 ${small ? "text-[7px]" : "text-[9px]"}`}>
          Discover
        </span>
      </span>
    );
  }
  return (
    <span className={`font-display uppercase tracking-[0.24em] text-white/85 ${small ? "text-[8px]" : "text-[10px]"}`}>
      Lovable
    </span>
  );
}

function Chip() {
  return (
    <span
      aria-hidden
      className="relative block h-[13%] w-[13%] min-h-6 min-w-8 overflow-hidden rounded-[22%]"
      style={{
        background: "linear-gradient(140deg,#e8d3a3 0%,#a9864e 42%,#f4e6c4 62%,#8a6a38 100%)",
        boxShadow: "inset 0 1px 2px rgba(255,255,255,0.55), inset 0 -2px 4px rgba(60,40,10,0.45)",
      }}
    >
      <span className="absolute inset-x-1 top-1/2 h-px bg-black/25" />
      <span className="absolute inset-y-1 left-1/2 w-px bg-black/25" />
      <span className="absolute inset-x-1 top-[28%] h-px bg-black/20" />
      <span className="absolute inset-x-1 bottom-[28%] h-px bg-black/20" />
    </span>
  );
}

export function CardPayment({
  demo,
  total,
  formRef,
  errorSignal,
  validatorRef,
  onConfirm,
  onBlocked,
}: {
  demo: boolean;
  total: number;
  formRef: RefObject<HTMLFormElement | null>;
  errorSignal: string;
  validatorRef: RefObject<(() => boolean) | null>;
  onConfirm: () => void;
  onBlocked: () => void;
}) {
  const reduce = useReducedMotion();
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [flipped, setFlipped] = useState(false);
  const [phase, setPhase] = useState<"idle" | "flying" | "processing">("idle");
  const [errors, setErrors] = useState<CardErrors>({});
  const [nudge, setNudge] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);
  const [maxDrag, setMaxDrag] = useState(0);

  const rotateX = useSpring(0, { stiffness: 170, damping: 18 });
  const rotateY = useSpring(0, { stiffness: 170, damping: 18 });

  const brandId: CardBrandId = demo ? detectCardBrand(number).id : "unknown";
  const brand = CARD_BRANDS[brandId];
  const skin = SKINS[brandId];

  const fields = useMemo(
    () => ({ number, name, expiry, cvv }),
    [number, name, expiry, cvv],
  );

  useEffect(() => {
    validatorRef.current = () => {
      if (!demo) return true;
      const next = validateCard(fields);
      setErrors(next);
      if (Object.keys(next).length > 0) {
        setNudge((value) => value + 1);
        return false;
      }
      return true;
    };
    return () => {
      validatorRef.current = null;
    };
  }, [demo, fields, validatorRef]);

  const dragProgress = useTransform(dragX, (value) => {
    if (!maxDrag) return 0;
    return Math.min(1, Math.max(0, value / maxDrag));
  });
  const fillWidth = useTransform(dragProgress, (value) => `${value * 100}%`);
  const knobOpacity = useTransform(dragProgress, [0, 0.9], [1, 0.55]);
  const hintOpacity = useTransform(dragProgress, [0, 0.35], [1, 0]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const knob = knobRef.current;
      if (!knob) return;
      setMaxDrag(Math.max(0, track.clientWidth - knob.offsetWidth - 8));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  const resetCard = useCallback(() => {
    setPhase("idle");
    dragX.set(0);
    setErrors({});
    setMessage(null);
    if (stageRef.current) {
      stageRef.current.style.zIndex = "";
      animate(stageRef.current, { x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }, { duration: 0.35 });
    }
  }, [dragX]);

  useEffect(() => {
    if (!errorSignal) return;
    const id = window.setTimeout(resetCard, 0);
    return () => window.clearTimeout(id);
  }, [errorSignal, resetCard]);

  useEffect(() => {
    if (!nudge) return;
    if (stageRef.current) {
      animate(stageRef.current, { x: [0, -9, 9, -5, 5, 0] }, { duration: 0.45, ease: "easeInOut" });
    }
  }, [nudge]);

  const fillDemo = () => {
    setNumber(formatCardNumber(DEMO_CARD.number));
    setName(DEMO_CARD.name);
    setExpiry(DEMO_CARD.expiry);
    setCvv(DEMO_CARD.cvv);
    setErrors({});
    setMessage("Demo card loaded — it validates but never charges.");
  };

  const flyToDock = async (): Promise<void> => {
    const stage = stageRef.current;
    if (!stage || reduce) return;
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-checkout-commit]"),
    );
    const target = targets.find((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight;
    });
    if (!target) return;
    const from = stage.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    stage.style.zIndex = "80";
    await animate(
      stage,
      { x: dx, y: dy, scale: 0.12, opacity: 0.25, rotate: -7 },
      { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
    ).finished;
    animate(target, { scale: [1, 1.07, 1] }, { duration: 0.45, ease: "easeOut" });
  };

  const runConfirm = async () => {
    if (phase !== "idle") return;

    if (demo) {
      const next = validateCard(fields);
      setErrors(next);
      if (Object.keys(next).length > 0) {
        setMessage(null);
        setNudge((value) => value + 1);
        onBlocked();
        return;
      }
    }

    const form = formRef.current;
    if (form && !form.checkValidity()) {
      setMessage("Some delivery details are still missing — we've highlighted them above.");
      setNudge((value) => value + 1);
      form.reportValidity();
      onBlocked();
      return;
    }

    setMessage(null);
    setPhase("flying");
    if (!reduce) {
      animate(dragX, maxDrag, { duration: 0.4, ease: [0.22, 1, 0.36, 1] });
      await flyToDock();
    }
    setPhase("processing");
    onConfirm();
  };

  useEffect(() => {
    if (phase !== "processing") return;
    const timeout = window.setTimeout(() => {
      if (phase === "processing") resetCard();
    }, 12_000);
    return () => window.clearTimeout(timeout);
  }, [phase, resetCard]);

  const onTilt = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduce || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 11);
    rotateX.set(-py * 8);
  };

  const onTiltEnd = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  const displayNumber =
    demo && number ? formatCardNumber(number) : "•••• •••• •••• ••••";
  const displayName = demo && name.trim() ? name.trim().toUpperCase() : "YOUR NAME";
  const displayExpiry = demo && expiry ? expiry : "MM/YY";
  const displayCvv = demo && cvv ? cvv : brand.cvvLength === 4 ? "••••" : "•••";
  const busy = phase !== "idle";

  return (
    <div className="rounded-[1.35rem] border border-line bg-gradient-to-b from-cream to-ivory-deep/40 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[12px] font-medium">
            <LockKeyhole className="size-4 text-champagne-dark" aria-hidden />
            {demo ? "Secure card preview" : "PayFast secure payment"}
          </p>
          <p className="mt-1 text-[10px] leading-relaxed text-stone">
            {demo
              ? "Preview checkout — card details stay in this browser and no money moves."
              : "Your card is entered on PayFast's encrypted page. We never see or store it."}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 border border-line bg-cream px-2 py-1 text-[8px] uppercase tracking-[0.16em] text-stone">
          <ShieldCheck className="size-3 text-champagne-dark" aria-hidden />
          PCI-safe flow
        </span>
      </div>

      <div
        className="mt-5 [perspective:1600px]"
        onPointerMove={onTilt}
        onPointerLeave={onTiltEnd}
      >
        <div ref={stageRef} className="relative mx-auto w-full max-w-[420px]">
          <motion.div
            aria-hidden
            initial={reduce ? false : { opacity: 0, y: 26, rotateX: 14 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative"
          >
            <div className="relative aspect-[1.586/1] w-full" style={{ transformStyle: "preserve-3d" }}>
              <motion.div
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div
                  className="absolute inset-0 overflow-hidden rounded-[1.15rem] border border-white/15 shadow-[0_28px_60px_-28px_rgba(15,10,8,0.75)]"
                  style={{
                    backfaceVisibility: "hidden",
                    background: skin.gradient,
                  }}
                >
                  <span
                    className="pointer-events-none absolute -left-1/3 top-0 h-full w-2/3 opacity-60"
                    style={{
                      background:
                        "linear-gradient(115deg,transparent 20%,rgba(255,255,255,0.14) 48%,transparent 72%)",
                      transform: "skewX(-12deg)",
                    }}
                  />
                  <span
                    className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full blur-3xl"
                    style={{ background: skin.rule }}
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-70"
                    style={{
                      backgroundImage:
                        "repeating-radial-gradient(circle at 88% 8%, transparent 0 13px, rgba(255,255,255,0.055) 13px 14px)",
                    }}
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
                    style={{
                      background:
                        "linear-gradient(90deg,transparent,rgba(214,185,133,0.55) 18%,rgba(214,185,133,0.55) 82%,transparent)",
                    }}
                  />
                  <div
                    className="relative flex h-full flex-col justify-between"
                    style={{ padding: "6.5% 6.5% 6%" }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-display text-[clamp(0.85rem,2.4vw,1.15rem)] uppercase tracking-[0.28em] text-white/90">
                          Lovable Store
                        </p>
                        <p className="mt-0.5 text-[7px] uppercase tracking-[0.24em] text-white/40">
                          Private client · South Africa
                        </p>
                      </div>
                      <span className="flex items-center gap-2 text-white/55">
                        <Wifi className="size-4 rotate-90" aria-hidden />
                        <Nfc className="size-4" aria-hidden />
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-3">
                        <Chip />
                        <p
                          className="font-sans font-medium tabular-nums text-white/95"
                          style={{
                            fontSize: "clamp(0.88rem, 2.9vw, 1.3rem)",
                            letterSpacing: "0.12em",
                            textShadow: "0 1px 2px rgba(0,0,0,0.35)",
                          }}
                        >
                          {displayNumber}
                        </p>
                      </div>

                      <div className="mt-4 flex items-end justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[6.5px] uppercase tracking-[0.2em] text-white/40">
                            Card holder
                          </p>
                          <p className="mt-0.5 truncate text-[clamp(0.6rem,1.9vw,0.8rem)] font-medium uppercase tracking-[0.14em] text-white/90">
                            {displayName}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-[6.5px] uppercase tracking-[0.2em] text-white/40">
                            Expires
                          </p>
                          <p className="mt-0.5 text-[clamp(0.6rem,1.9vw,0.8rem)] font-medium tabular-nums tracking-[0.1em] text-white/90">
                            {displayExpiry}
                          </p>
                        </div>
                        <div className="shrink-0">
                          <BrandMark brand={brandId} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="absolute inset-0 overflow-hidden rounded-[1.15rem] border border-white/12 shadow-[0_28px_60px_-28px_rgba(15,10,8,0.75)]"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    background: "linear-gradient(150deg,#181310 0%,#2b221a 55%,#120e0b 100%)",
                  }}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-40"
                    style={{
                      backgroundImage:
                        "repeating-radial-gradient(circle at 6% 96%, transparent 0 16px, rgba(255,255,255,0.05) 16px 17px)",
                    }}
                  />
                  <div className="relative flex h-full flex-col pb-[5%]">
                    <div className="mt-[7%] h-[15%] w-full bg-black/85" />
                    <div className="mt-[5%] px-[6%]">
                      <div className="flex items-stretch gap-2">
                        <div className="relative flex-1 overflow-hidden rounded-[3px] bg-[#efe5d4]">
                          <span
                            aria-hidden
                            className="absolute inset-0 opacity-30"
                            style={{
                              backgroundImage:
                                "repeating-linear-gradient(115deg,transparent 0 6px,rgba(0,0,0,0.18) 6px 7px)",
                            }}
                          />
                          <p className="relative px-3 py-[7px] text-[7.5px] uppercase tracking-[0.14em] text-black/45">
                            Authorised signature
                          </p>
                        </div>
                        <div className="flex w-[24%] items-center justify-between rounded-[3px] bg-[#efe5d4] px-2.5">
                          <span className="text-[6.5px] uppercase tracking-[0.12em] text-black/45">CVV</span>
                          <span className="text-[13px] tabular-nums text-black/80">{displayCvv}</span>
                        </div>
                      </div>
                      <p className="mt-2 text-[6.5px] uppercase tracking-[0.18em] text-white/30">
                        Not valid unless signed · Subject to cardholder agreement
                      </p>
                    </div>
                    <p
                      aria-hidden
                      className="mt-5 px-[6%] font-display uppercase leading-none tracking-[0.26em] text-white/[0.09]"
                      style={{ fontSize: "clamp(0.95rem,2.9vw,1.4rem)" }}
                    >
                      Lovable Store
                    </p>
                    <div className="mt-auto flex items-end justify-between gap-3 px-[6%]">
                      <div>
                        <p className="max-w-[46ch] text-[6.5px] leading-[1.7] text-white/40">
                          {demo
                            ? "Preview card issued for demonstration only. No real account, no charge and no card data leaves this device."
                            : "Payments are processed on PayFast's PCI-DSS compliant page. Lovable Store never sees or stores card data."}
                        </p>
                        <p className="mt-1.5 text-[6px] uppercase tracking-[0.18em] text-white/30">
                          Client care · hello@lovablestore.co.za · Johannesburg
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="flex gap-1" aria-hidden>
                          {["#d6b985", "#b99a65", "#8c7043"].map((colour) => (
                            <span
                              key={colour}
                              className="size-1.5 rounded-full"
                              style={{ background: colour }}
                            />
                          ))}
                        </span>
                        <BrandMark brand={brandId} small />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {demo ? (
          <motion.div
            key="fields"
            initial={false}
            className="mt-6 grid gap-3 sm:grid-cols-2"
          >
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between">
                <label htmlFor="cardNumber" className="label mb-1.5">
                  Card number
                </label>
                <button
                  type="button"
                  onClick={fillDemo}
                  className="mb-1.5 inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.12em] text-champagne-dark transition-colors hover:text-oxblood"
                >
                  <Sparkles className="size-3" aria-hidden />
                  Use demo card
                </button>
              </div>
              <div className="relative">
                <input
                  id="cardNumber"
                  value={number}
                  onChange={(event) => {
                    setNumber(formatCardNumber(event.target.value));
                    setErrors((current) => ({ ...current, number: undefined }));
                  }}
                  onBlur={() => setFlipped(false)}
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="4242 4242 4242 4242"
                  aria-invalid={Boolean(errors.number)}
                  className="field pr-16 tabular-nums tracking-[0.06em]"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  {brandId === "unknown" ? (
                    <CreditCard className="size-5 text-stone" aria-hidden />
                  ) : (
                    <BrandMark brand={brandId} small />
                  )}
                </span>
              </div>
              <FieldMessage message={errors.number} />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="cardName" className="label">
                Name on card
              </label>
              <input
                id="cardName"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setErrors((current) => ({ ...current, name: undefined }));
                }}
                autoComplete="cc-name"
                placeholder="T. Mokoena"
                aria-invalid={Boolean(errors.name)}
                className="field uppercase tracking-[0.08em]"
              />
              <FieldMessage message={errors.name} />
            </div>

            <div>
              <label htmlFor="cardExpiry" className="label">
                Expiry
              </label>
              <input
                id="cardExpiry"
                value={expiry}
                onChange={(event) => {
                  setExpiry(formatExpiry(event.target.value));
                  setErrors((current) => ({ ...current, expiry: undefined }));
                }}
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/YY"
                aria-invalid={Boolean(errors.expiry)}
                className="field tabular-nums tracking-[0.08em]"
              />
              <FieldMessage message={errors.expiry} />
            </div>

            <div>
              <label htmlFor="cardCvv" className="label">
                CVV
              </label>
              <input
                id="cardCvv"
                value={cvv}
                onChange={(event) => {
                  setCvv(event.target.value.replace(/\D/g, "").slice(0, brand.cvvLength));
                  setErrors((current) => ({ ...current, cvv: undefined }));
                }}
                onFocus={() => setFlipped(true)}
                onBlur={() => setFlipped(false)}
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder={brand.cvvLength === 4 ? "••••" : "•••"}
                aria-invalid={Boolean(errors.cvv)}
                className="field tabular-nums tracking-[0.12em]"
              />
              <FieldMessage message={errors.cvv} />
            </div>
          </motion.div>
        ) : (
          <motion.p
            key="handoff"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-5 border border-line bg-cream px-4 py-3 text-[11px] leading-relaxed text-stone"
          >
            Tap the card or swipe below to continue to PayFast, where you can pay
            by card or Instant EFT. Your order is confirmed the moment PayFast
            notifies us.
          </motion.p>
        )}
      </AnimatePresence>

      <div className="mt-5">
        <div
          ref={trackRef}
          className="relative h-14 overflow-hidden rounded-full border border-line bg-ivory-deep/60"
        >
          <motion.span
            aria-hidden
            className="absolute inset-y-0 left-0 bg-oxblood/15"
            style={{ width: fillWidth }}
          />
          <motion.span
            aria-hidden
            style={{ opacity: hintOpacity }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 pl-10 text-[10px] uppercase tracking-[0.18em] text-stone"
          >
            {busy ? "Processing…" : demo ? `Swipe to pay ${formatZAR(total)}` : `Swipe to continue · ${formatZAR(total)}`}
          </motion.span>
          <motion.div
            ref={knobRef}
            role="button"
            tabIndex={0}
            aria-label={
              demo
                ? `Swipe, or press Enter, to confirm the demo payment of ${formatZAR(total)}`
                : `Swipe, or press Enter, to continue to PayFast for ${formatZAR(total)}`
            }
            aria-disabled={busy}
            drag={busy ? false : "x"}
            dragConstraints={{ left: 0, right: maxDrag }}
            dragElastic={0.04}
            dragMomentum={false}
            style={{ x: dragX, opacity: knobOpacity }}
            whileTap={{ scale: 0.97 }}
            onDragEnd={(_, info) => {
              if (info.offset.x >= maxDrag * 0.8) {
                void runConfirm();
              } else {
                animate(dragX, 0, { type: "spring", stiffness: 420, damping: 34 });
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                void runConfirm();
              }
            }}
            className={`absolute bottom-1 left-1 top-1 flex w-16 items-center justify-center rounded-full text-ivory shadow-lift outline-none focus-visible:ring-2 focus-visible:ring-champagne ${
              busy ? "cursor-wait bg-ink/70" : "cursor-grab bg-ink active:cursor-grabbing"
            }`}
          >
            {phase === "processing" || phase === "flying" ? (
              <Loader2 className="size-5 animate-spin" aria-hidden />
            ) : (
              <ArrowRight className="size-5" aria-hidden />
            )}
          </motion.div>
        </div>

        <div className="mt-3 flex min-h-5 flex-wrap items-center justify-between gap-2">
          <p role="status" aria-live="polite" className="text-[10px] leading-relaxed text-oxblood">
            {errors.form || message}
          </p>
          <button
            type="button"
            onClick={resetCard}
            className="inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.12em] text-stone transition-colors hover:text-oxblood"
          >
            <RotateCcw className="size-3" aria-hidden />
            Reset card
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-[9px] uppercase tracking-[0.14em] text-stone">
          <span className="flex items-center gap-1.5">
            <Check className="size-3 text-champagne-dark" aria-hidden />
            {demo ? "Preview only · no charge" : "Secure hand-off to PayFast"}
          </span>
          <span className="flex items-center gap-2">
            <span>Visa</span>
            <span className="opacity-40">·</span>
            <span>Mastercard</span>
            <span className="opacity-40">·</span>
            <span>Amex</span>
          </span>
        </div>
      </div>

      {phase === "processing" ? (
        <p className="sr-only" role="status">
          Payment confirmed, placing your order.
        </p>
      ) : null}
      {flipped ? <span className="sr-only">Showing the back of the card</span> : null}
    </div>
  );
}

function FieldMessage({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-[10px] text-oxblood">
      {message}
    </p>
  );
}
