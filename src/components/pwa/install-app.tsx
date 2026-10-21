"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, MoreVertical, Plus, Share, Sparkles, X } from "lucide-react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "lovable-install-dismissed";
const DISMISS_DAYS = 7;

function wasDismissed(): boolean {
  try {
    const value = window.localStorage.getItem(DISMISS_KEY);
    if (!value) return false;
    return Date.now() - Number(value) < DISMISS_DAYS * 86_400_000;
  } catch {
    return false;
  }
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function InstallApp() {
  const pathname = usePathname();
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIos(ios);

    let timer: number | undefined;
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPromptEvent);
      if (!wasDismissed()) {
        timer = window.setTimeout(() => setVisible(true), 3500);
      }
    };
    const onInstalled = () => {
      setInstalled(true);
      setVisible(false);
      setHelpOpen(false);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    if (ios && !wasDismissed()) {
      timer = window.setTimeout(() => setVisible(true), 5000);
    }

    return () => {
      if (timer) window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    const openHelp = () => setHelpOpen(true);
    window.addEventListener("lovable:install", openHelp);
    return () => window.removeEventListener("lovable:install", openHelp);
  }, []);

  useEffect(() => {
    if (!helpOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setHelpOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [helpOpen]);

  function dismiss() {
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // Private mode — the banner simply returns next visit.
    }
    setVisible(false);
    setHelpOpen(false);
  }

  async function install() {
    if (!prompt) {
      setHelpOpen(true);
      return;
    }
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === "accepted") {
      setVisible(false);
    } else {
      dismiss();
    }
    setPrompt(null);
  }

  if (installed) return null;

  const suppressBanner =
    pathname.startsWith("/product/") ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/account/login") ||
    pathname.startsWith("/account/register");

  return (
    <>
      {visible && !suppressBanner ? (
        <div className="install-banner">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-oxblood text-ivory">
              <Sparkles className="size-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-ink">
                Lovable Store, in your pocket
              </p>
              <p className="truncate text-[11px] text-stone">
                {isIos
                  ? "Add it to your Home Screen in Safari."
                  : "Faster checkout, saved pages, full-screen shopping."}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button type="button" onClick={install} className="install-action">
              <Download className="size-3.5" aria-hidden />
              Install
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="flex size-9 items-center justify-center rounded-full text-stone hover:text-ink"
              aria-label="Dismiss install prompt"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      ) : null}

      {helpOpen ? (
        <div
          className="fixed inset-0 z-[120] flex items-end justify-center bg-ink/55 p-3 backdrop-blur-sm sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-heading"
          onClick={(event) => {
            if (event.target === event.currentTarget) setHelpOpen(false);
          }}
        >
          <div className="surface-card w-full max-w-md p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow text-champagne-dark">The app</p>
                <h2 id="install-heading" className="mt-2 font-display text-3xl leading-none">
                  Install Lovable Store
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setHelpOpen(false)}
                className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line text-stone"
                aria-label="Close install instructions"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-stone">
              Lovable Store installs from your browser — no app store, no
              download size. It opens full-screen with its own icon.
            </p>

            <ol className="mt-6 space-y-4 text-sm text-ink-soft">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ivory-deep text-[11px] font-medium">
                  1
                </span>
                <span className="pt-0.5">
                  {isIos ? (
                    <>
                      Tap the <Share className="mx-1 inline size-4 text-oxblood" aria-hidden />
                      Share button in Safari.
                    </>
                  ) : (
                    <>
                      Open the browser menu{" "}
                      <MoreVertical className="mx-1 inline size-4 text-oxblood" aria-hidden />
                      in the top-right corner.
                    </>
                  )}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ivory-deep text-[11px] font-medium">
                  2
                </span>
                <span className="pt-0.5">
                  {isIos ? (
                    <>
                      Choose <strong>Add to Home Screen</strong>{" "}
                      <Plus className="mx-1 inline size-4 text-oxblood" aria-hidden />.
                    </>
                  ) : (
                    <>
                      Choose <strong>Install app</strong> or{" "}
                      <strong>Add to Home screen</strong>.
                    </>
                  )}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ivory-deep text-[11px] font-medium">
                  3
                </span>
                <span className="pt-0.5">
                  Confirm — Lovable Store appears with the gift icon and opens
                  like an app.
                </span>
              </li>
            </ol>

            <p className="mt-6 text-[11px] leading-relaxed text-stone">
              On a phone? The PWA version is the fastest way in today. A signed
              Android APK can be produced for the live domain once publishing is
              final.
            </p>

            {prompt ? (
              <button type="button" onClick={install} className="btn-primary mt-5 w-full">
                <Download className="size-4" aria-hidden />
                Install now
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
