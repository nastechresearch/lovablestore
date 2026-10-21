"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  CheckCheck,
  Headset,
  Loader2,
  MessageSquareText,
  Send,
  X,
} from "lucide-react";

const STORAGE_KEY = "bm_support_ref";

type Message = {
  id: string;
  sender: string;
  body: string;
  createdAt: string;
};

type Conversation = {
  ref: string;
  subject: string;
  status: string;
  createdAt: string;
  messages: Message[];
};

const QUICK_REPLIES = [
  "Where is my order?",
  "Help me choose a gift",
  "I'd like a customisation quote",
  "Something arrived damaged",
];

function timeLabel(value: string): string {
  return new Intl.DateTimeFormat("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function SupportWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [booting, setBooting] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [viewer, setViewer] = useState<{ signedIn: boolean; name: string; email: string }>({
    signedIn: false,
    name: "",
    email: "",
  });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Order help");
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const loadConversation = useCallback(async (ref: string) => {
    try {
      const response = await fetch(`/api/support?ref=${encodeURIComponent(ref)}`, {
        cache: "no-store",
      });
      if (response.status === 404) {
        window.localStorage.removeItem(STORAGE_KEY);
        setConversation(null);
        return false;
      }
      const data = (await response.json()) as { conversation?: Conversation };
      if (data.conversation) {
        setConversation(data.conversation);
        return true;
      }
    } catch {
      // Network wobble — polling will retry.
    }
    return false;
  }, []);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setBooting(true);
    setError("");

    async function boot() {
      const ref = window.localStorage.getItem(STORAGE_KEY);
      if (ref) {
        const found = await loadConversation(ref);
        if (!cancelled) setBooting(false);
        if (found) return;
      }
      try {
        const response = await fetch("/api/account/whoami", { cache: "no-store" });
        const data = (await response.json()) as {
          signedIn?: boolean;
          firstName?: string;
          lastName?: string;
          email?: string;
        };
        if (!cancelled && data.signedIn) {
          setViewer({
            signedIn: true,
            name: `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim(),
            email: data.email ?? "",
          });
        }
      } catch {
        // Guests can still start a chat.
      }
      if (!cancelled) setBooting(false);
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [open, loadConversation]);

  useEffect(() => {
    if (!open || !conversation) return;
    const timer = window.setInterval(() => {
      void loadConversation(conversation.ref);
    }, 5_000);
    return () => window.clearInterval(timer);
  }, [open, conversation?.ref, loadConversation, conversation]);

  useEffect(() => {
    if (open) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 350);
      return () => window.clearTimeout(timer);
    }
  }, [open, conversation?.ref]);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [conversation?.messages.length, open]);

  async function startChat() {
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "start", name, email, subject, message }),
      });
      const data = (await response.json()) as {
        error?: string;
        ref?: string;
        existing?: boolean;
        conversation?: Conversation;
      };
      if (!response.ok) throw new Error(data.error || "Could not start the chat.");
      if (data.ref) {
        window.localStorage.setItem(STORAGE_KEY, data.ref);
        await loadConversation(data.ref);
      } else if (data.conversation) {
        window.localStorage.setItem(STORAGE_KEY, data.conversation.ref);
        setConversation(data.conversation);
      }
      setMessage("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not start the chat.");
    } finally {
      setSending(false);
    }
  }

  async function sendMessage() {
    if (!conversation || !draft.trim() || sending) return;
    const body = draft.trim();
    setSending(true);
    setError("");
    setDraft("");
    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "message", ref: conversation.ref, message: body }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Message could not be sent.");
      await loadConversation(conversation.ref);
    } catch (cause) {
      setDraft(body);
      setError(cause instanceof Error ? cause.message : "Message could not be sent.");
    } finally {
      setSending(false);
    }
  }

  function resetChat() {
    window.localStorage.removeItem(STORAGE_KEY);
    setConversation(null);
    setDraft("");
    setMessage("");
    setError("");
  }

  if (
    pathname.startsWith("/product/") ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/account/login") ||
    pathname.startsWith("/account/register")
  ) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-[calc(5.3rem+env(safe-area-inset-bottom))] right-4 z-[60] flex size-12 items-center justify-center rounded-full border border-line bg-cream text-ink shadow-[0_18px_50px_-18px_rgba(30,20,10,0.45)] transition-colors hover:border-oxblood hover:text-oxblood sm:size-auto sm:gap-2.5 sm:rounded-none sm:px-3.5 sm:py-3 md:bottom-6 md:right-6"
        aria-expanded={open}
        aria-controls="support-panel"
        aria-label={open ? "Close concierge" : "Chat with the concierge"}
      >
        {open ? (
          <X className="size-4" aria-hidden />
        ) : (
          <span className="relative">
            <MessageSquareText className="size-4" aria-hidden />
            <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-oxblood" aria-hidden />
          </span>
        )}
        <span className="hidden text-[10px] font-medium uppercase tracking-[0.14em] sm:inline">
          {open ? "Close" : "Concierge"}
        </span>
      </button>

      {open ? (
        <div
          id="support-panel"
          className="fixed bottom-20 right-3 z-[95] flex h-[min(620px,calc(100dvh-7rem))] w-[calc(100vw-1.5rem)] max-w-[390px] flex-col border border-line bg-cream shadow-[0_30px_90px_-30px_rgba(30,20,10,0.55)] sm:bottom-24 sm:right-6"
          role="dialog"
          aria-modal="false"
          aria-label="Chat with the Lovable Store studio"
        >
          <div className="flex items-center justify-between gap-3 border-b border-line bg-ink px-4 py-3.5 text-ivory">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center border border-ivory/20 bg-ivory/5 text-champagne">
                <Headset className="size-4" aria-hidden />
              </span>
              <div>
                <p className="font-display text-lg leading-none">Studio concierge</p>
                <p className="mt-1 flex items-center gap-1.5 text-[8.5px] uppercase tracking-[0.12em] text-ivory/55">
                  <span className="size-1.5 rounded-full bg-[#8fbf7f]" aria-hidden />
                  Mon–Sat · 09:00–18:00 SAST
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid size-9 place-items-center text-ivory/60 hover:text-ivory"
              aria-label="Close chat"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-ivory-deep/20 px-4 py-4">
            {booting ? (
              <div className="flex h-full items-center justify-center text-stone">
                <Loader2 className="size-5 animate-spin" aria-hidden />
              </div>
            ) : conversation ? (
              <>
                <p className="text-center text-[8.5px] uppercase tracking-[0.14em] text-stone">
                  {conversation.subject} · {conversation.ref}
                </p>
                {conversation.messages.map((entry) => {
                  const mine = entry.sender === "CUSTOMER";
                  const system = entry.sender === "SYSTEM";
                  return (
                    <div key={entry.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[86%] border px-3 py-2 text-[11px] leading-relaxed ${
                          mine
                            ? "border-ink bg-ink text-ivory"
                            : system
                              ? "border-line bg-cream text-stone"
                              : "border-line bg-cream text-ink"
                        }`}
                      >
                        {!mine ? (
                          <p className="mb-1 text-[8px] uppercase tracking-[0.14em] text-champagne-dark">
                            {system ? "Concierge" : "Studio stylist"}
                          </p>
                        ) : null}
                        <p className="whitespace-pre-line">{entry.body}</p>
                        <p
                          className={`mt-1 flex items-center gap-1 text-[8px] ${
                            mine ? "justify-end text-ivory/70" : "text-stone/80"
                          }`}
                        >
                          {timeLabel(entry.createdAt)}
                          {mine ? <CheckCheck className="size-2.5" aria-hidden /> : null}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {conversation.status === "CLOSED" ? (
                  <p className="border border-line bg-cream p-2.5 text-center text-[9.5px] text-stone">
                    This chat was closed. Send a message to reopen it.
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {QUICK_REPLIES.slice(0, 3).map((reply) => (
                    <button
                      key={reply}
                      type="button"
                      onClick={() => {
                        setDraft(reply);
                        inputRef.current?.focus();
                      }}
                      className="border border-line bg-cream px-2 py-1 text-[8.5px] uppercase tracking-[0.08em] text-stone hover:border-oxblood hover:text-oxblood"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="border border-line bg-cream p-3.5">
                  <p className="font-display text-xl">How can we help?</p>
                  <p className="mt-1 text-[10px] leading-relaxed text-stone">
                    Ask about an order, a gift, sizing or a custom piece. A real person from the
                    Johannesburg studio replies during trading hours.
                  </p>
                </div>
                {!viewer.signedIn ? (
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="support-name" className="label">Your name</label>
                      <input
                        id="support-name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="field"
                        placeholder="Thandi M."
                      />
                    </div>
                    <div>
                      <label htmlFor="support-email" className="label">Email</label>
                      <input
                        id="support-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="field"
                        placeholder="you@example.co.za"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-[9.5px] text-stone">
                    Chatting as <span className="text-ink">{viewer.name}</span> · {viewer.email}
                  </p>
                )}
                <div>
                  <label htmlFor="support-subject" className="label">Topic</label>
                  <select
                    id="support-subject"
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    className="field"
                  >
                    <option>Order help</option>
                    <option>Gift advice</option>
                    <option>Customisation</option>
                    <option>Delivery &amp; returns</option>
                    <option>Something else</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="support-message" className="label">Message</label>
                  <textarea
                    id="support-message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    className="field min-h-[86px] resize-none"
                    placeholder="Tell us what you need help with…"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void startChat()}
                  disabled={sending || !message.trim()}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {sending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
                  {sending ? "Starting chat…" : "Start chat"}
                </button>
                <p className="text-center text-[8.5px] leading-relaxed text-stone">
                  We reply in English, isiZulu, Afrikaans or Sesotho where we can.
                </p>
              </div>
            )}

            {error ? (
              <p role="alert" className="border border-oxblood/30 bg-oxblood/5 p-2.5 text-[10px] text-oxblood">
                {error}
              </p>
            ) : null}
          </div>

          {conversation ? (
            <div className="border-t border-line bg-cream p-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void sendMessage();
                    }
                  }}
                  rows={1}
                  className="field max-h-24 min-h-[42px] flex-1 resize-none py-2.5"
                  placeholder="Write a message…"
                  aria-label="Message"
                />
                <button
                  type="button"
                  onClick={() => void sendMessage()}
                  disabled={sending || !draft.trim()}
                  className="grid size-[42px] shrink-0 place-items-center bg-ink text-ivory transition-colors hover:bg-oxblood disabled:opacity-50"
                  aria-label="Send message"
                >
                  {sending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
                </button>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={resetChat}
                  className="text-[8px] uppercase tracking-[0.1em] text-stone hover:text-oxblood"
                >
                  Start a new chat
                </button>
                <a
                  href="/contact"
                  className="inline-flex items-center gap-1 text-[8px] uppercase tracking-[0.1em] text-stone hover:text-oxblood"
                >
                  Contact page
                  <ArrowUpRight className="size-2.5" aria-hidden />
                </a>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
