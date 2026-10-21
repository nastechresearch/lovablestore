import Link from "next/link";
import { CheckCheck, Headset, Mail, RotateCcw, Send, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateShort } from "@/lib/format";
import { replySupportAction, setSupportStatusAction } from "@/actions/support";
import { AdminHeading, EmptyState } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

function timeOf(date: Date): string {
  return new Intl.DateTimeFormat("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const flags = await searchParams;

  const conversations = await prisma.supportConversation.findMany({
    orderBy: [{ status: "asc" }, { lastMessageAt: "desc" }],
    take: 80,
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { sender: true, body: true, createdAt: true },
      },
      _count: { select: { messages: true } },
    },
  });

  const selected =
    conversations.find((conversation) => conversation.id === flags.c) ??
    conversations[0] ??
    null;

  const detail = selected
    ? await prisma.supportConversation.findUnique({
        where: { id: selected.id },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      })
    : null;

  if (selected) {
    await prisma.supportMessage.updateMany({
      where: { conversationId: selected.id, sender: "CUSTOMER", readByAgent: false },
      data: { readByAgent: true },
    });
  }

  const openCount = conversations.filter((conversation) => conversation.status === "OPEN").length;

  return (
    <div className="space-y-6">
      <AdminHeading
        eyebrow="Concierge"
        title="Live support"
        description={`${openCount} open conversation${openCount === 1 ? "" : "s"} · customers see replies in the storefront chat within five seconds.`}
      />

      {conversations.length === 0 ? (
        <EmptyState
          title="No conversations yet."
          copy="When a customer starts a chat from the storefront it will appear here with their order context."
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
          <div className="max-h-[720px] overflow-y-auto border border-line bg-cream">
            <ul className="divide-y divide-line">
              {conversations.map((conversation) => {
                const active = conversation.id === selected?.id;
                const latest = conversation.messages[0];
                return (
                  <li key={conversation.id}>
                    <Link
                      href={`/admin/support?c=${conversation.id}`}
                      className={`block px-4 py-3.5 transition-colors ${
                        active ? "bg-ink text-ivory" : "hover:bg-ivory-deep/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[11px] font-medium">
                          {conversation.name}
                        </span>
                        <span
                          className={`shrink-0 text-[8px] uppercase tracking-[0.1em] ${
                            conversation.status === "OPEN"
                              ? active
                                ? "text-ivory"
                                : "text-oxblood"
                              : active
                                ? "text-ivory/70"
                                : "text-stone"
                          }`}
                        >
                          {conversation.status}
                        </span>
                      </div>
                      <p
                        className={`mt-0.5 text-[9px] ${
                          active ? "text-ivory/50" : "text-stone"
                        }`}
                      >
                        {conversation.subject} · {conversation.ref}
                      </p>
                      {latest ? (
                        <p
                          className={`mt-1.5 truncate text-[10px] ${
                            active ? "text-ivory/70" : "text-ink/70"
                          }`}
                        >
                          <span className="uppercase tracking-[0.08em] text-champagne-dark">
                            {latest.sender === "CUSTOMER" ? "Customer" : latest.sender === "AGENT" ? "You" : "Auto"}
                          </span>
                          {" · "}
                          {latest.body}
                        </p>
                      ) : null}
                      <p className={`mt-1 text-[8px] uppercase tracking-[0.1em] ${active ? "text-ivory/35" : "text-stone/70"}`}>
                        {formatDateShort(conversation.lastMessageAt)} · {timeOf(conversation.lastMessageAt)} ·{" "}
                        {conversation._count.messages} messages
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {detail ? (
            <div className="flex min-h-[520px] flex-col border border-line bg-cream">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line bg-ivory-deep/25 px-4 py-3.5">
                <div>
                  <p className="font-display text-2xl leading-none">{detail.name}</p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9.5px] text-stone">
                    <a href={`mailto:${detail.email}`} className="inline-flex items-center gap-1 text-oxblood hover:underline">
                      <Mail className="size-3" aria-hidden />
                      {detail.email}
                    </a>
                    <span>{detail.subject}</span>
                    <span>{detail.ref}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {detail.status === "OPEN" ? (
                    <form action={setSupportStatusAction.bind(null, detail.id, "CLOSED")}>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 border border-line bg-cream px-2.5 py-1.5 text-[8.5px] uppercase tracking-[0.1em] text-stone hover:border-oxblood hover:text-oxblood"
                      >
                        <X className="size-3" aria-hidden />
                        Close chat
                      </button>
                    </form>
                  ) : (
                    <form action={setSupportStatusAction.bind(null, detail.id, "OPEN")}>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 border border-line bg-cream px-2.5 py-1.5 text-[8.5px] uppercase tracking-[0.1em] text-stone hover:border-oxblood hover:text-oxblood"
                      >
                        <RotateCcw className="size-3" aria-hidden />
                        Reopen
                      </button>
                    </form>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto bg-ivory-deep/15 px-4 py-4">
                {detail.messages.map((entry) => {
                  const mine = entry.sender === "AGENT";
                  const system = entry.sender === "SYSTEM";
                  return (
                    <div key={entry.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[82%] border px-3 py-2 text-[11px] leading-relaxed ${
                          mine
                            ? "border-ink bg-ink text-ivory"
                            : system
                              ? "border-dashed border-line bg-cream text-stone"
                              : "border-line bg-cream text-ink"
                        }`}
                      >
                        <p className="mb-1 text-[8px] uppercase tracking-[0.14em] opacity-60">
                          {mine ? "Studio stylist" : system ? "Automated greeting" : entry.sender}
                        </p>
                        <p className="whitespace-pre-line">{entry.body}</p>
                        <p className="mt-1 flex items-center justify-end gap-1 text-[8px] opacity-45">
                          {formatDateShort(entry.createdAt)} · {timeOf(entry.createdAt)}
                          {mine ? <CheckCheck className="size-2.5" aria-hidden /> : null}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form action={replySupportAction.bind(null, detail.id)} className="border-t border-line p-3">
                <label htmlFor="reply-body" className="sr-only">Reply</label>
                <textarea
                  id="reply-body"
                  name="body"
                  rows={3}
                  required
                  placeholder="Write a reply as the studio stylist…"
                  className="field resize-none"
                />
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[9px] text-stone">
                    Replies appear in the customer&rsquo;s chat. Be warm, specific and brief.
                  </p>
                  <button type="submit" className="btn-primary">
                    <Send className="size-3.5" aria-hidden />
                    Send reply
                  </button>
                </div>
              </form>
            </div>
          ) : null}
        </div>
      )}

      <div className="border border-line bg-ivory-deep/30 p-4 text-[10.5px] leading-relaxed text-stone">
        <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-champagne-dark">
          <Headset className="size-3.5" aria-hidden />
          Trading hours
        </p>
        <p className="mt-2">
          The storefront tells customers Mon–Sat, 09:00–18:00 SAST. Outside those hours, reply when
          you can — the customer will see it the next time they open the chat.
        </p>
      </div>
    </div>
  );
}
