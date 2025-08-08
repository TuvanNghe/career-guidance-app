// src/components/ChatLayout.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, PlusCircle, MessagesSquare } from "lucide-react";
import ChatShell from "./ChatShell";
import MessageInput from "./MessageInput";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Thread { id: string; title: string | null; updated_at: string; }
// ➜ Thêm localId để thay đúng placeholder khi gửi song song
interface Msg { role: "system" | "user" | "assistant"; content: string; localId?: number; }
interface Props { userId: string | null; }

export default function ChatLayout({ userId }: Props) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loadingThreads, setLT] = useState(false);
  const [threadId, setThreadId] = useState<string>();
  const [messages, setMessages] = useState<Msg[]>([]);
  const sidebarEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [quota, setQuota] = useState({ limit: 100, used: 0, remaining: 100 });

  // Chống stale response
  const threadsSeq = useRef(0);
  const quotaSeq = useRef(0);

  const loadThreads = async () => {
    setLT(true);
    const seq = ++threadsSeq.current;
    try {
      const res = await fetch("/api/chat/threads", {
        cache: "no-store",
        credentials: "include",
        headers: { "x-no-cache": Date.now().toString() },
      });
      const data: Thread[] = await res.json();
      if (seq === threadsSeq.current) setThreads(data ?? []);
    } finally {
      if (seq === threadsSeq.current) setLT(false);
    }
  };

  const refreshQuota = async (tid?: string) => {
    const seq = ++quotaSeq.current;
    const url = tid ? `/api/chat/quota?threadId=${tid}` : `/api/chat/quota`;
    try {
      const r = await fetch(url, {
        cache: "no-store",
        credentials: "include",
        headers: { "x-no-cache": Date.now().toString() },
      });
      const q = await r.json();
      if (q?.limit != null && seq === quotaSeq.current) setQuota(q);
    } catch {}
  };

  useEffect(() => { loadThreads(); }, [userId]);
  useEffect(() => { sidebarEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [threads]);

  const openThread = (id?: string) => {
    setThreadId(id);

    if (id) {
      fetch(`/api/chat/messages?threadId=${id}`, {
        cache: "no-store",
        credentials: "include",
        headers: { "x-no-cache": Date.now().toString() },
      })
        .then((res) => res.json())
        .then((msgs: Msg[]) => setMessages(msgs ?? []));
    } else {
      setMessages([
        {
          role: "system",
          content:
            "Xin chào, tôi là trợ lý Seven – có hơn 15 năm kinh nghiệm tư vấn hướng nghiệp. Tôi sẵn sàng hỗ trợ bạn với mọi câu hỏi về nghề nghiệp, và tư vấn kinh nghiệm phỏng vấn 1-1.",
        },
      ]);
    }

    // cập nhật quota ngay khi đổi thread
    refreshQuota(id);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  useEffect(() => { openThread(undefined); }, []);
  useEffect(() => { refreshQuota(threadId); }, [messages.length, threadId, userId]);

  // ➜ Nhận localId để map đúng placeholder
  const handleUserSend = (text: string, localId: number) => {
    if (!text || quota.remaining <= 0) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: "Đang trả lời…", localId },
    ]);

    // giảm quota lạc quan
    setQuota((q) => ({ ...q, used: q.used + 1, remaining: Math.max(q.remaining - 1, 0) }));
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 10);
  };

  // ➜ Trả về cũng nhận localId để thay đúng placeholder
  const handleSent = async (newId: string, assistantReply: string, localId: number) => {
    if (!threads.find((t) => t.id === newId)) {
      setThreads((prev) => [{ id: newId, title: null, updated_at: new Date().toISOString() }, ...prev]);
    }
    setThreadId(newId);

    setMessages((prev) => {
      const next = [...prev];
      const idx = next.findIndex(
        (m) => m.localId === localId && m.role === "assistant" && m.content === "Đang trả lời…"
      );
      if (idx !== -1) {
        next[idx] = { role: "assistant", content: assistantReply };
      } else {
        next.push({ role: "assistant", content: assistantReply });
      }
      return next;
    });

    await Promise.all([refreshQuota(newId), loadThreads()]);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <div className="grid h-[calc(100vh-48px)] grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className="flex h-full flex-col border-r">
        <header className="flex items-center justify-between border-b px-4 py-3 text-sm font-medium">
          <span className="inline-flex items-center gap-1">
            <MessagesSquare size={16} /> Đoạn chat
          </span>
          <button onClick={() => openThread(undefined)} className="inline-flex items-center gap-1 text-primary hover:underline">
            <PlusCircle size={14} /> Mới
          </button>
        </header>

        <ScrollArea className="flex-1">
          {loadingThreads && (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải…
            </div>
          )}

          {!loadingThreads && threads.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">Bạn chưa có cuộc trò chuyện nào.</p>
          )}

          {threads.map((t) => (
            <div
              key={t.id}
              onClick={() => openThread(t.id)}
              className={`cursor-pointer px-4 py-2 hover:bg-gray-100 ${t.id === threadId ? "bg-gray-200 font-semibold" : ""}`}
            >
              {t.title || "Cuộc trò chuyện mới"}
            </div>
          ))}

          <div ref={sidebarEndRef} />
        </ScrollArea>
      </aside>

      {/* Chat pane */}
      <section className="relative flex h-full flex-col">
        <div className="px-4 pt-2 text-xs text-muted-foreground">
          Còn lại:{" "}
          <span className={quota.remaining <= 5 ? "text-red-600 font-medium" : "font-medium"}>
            {quota.remaining}
          </span>
          /{quota.limit} tin nhắn
        </div>

        <ScrollArea className="flex-1 px-4 py-4 space-y-4">
          <ChatShell messages={messages} />
          <div ref={chatEndRef} />
        </ScrollArea>

        <MessageInput
          userId={userId}
          threadId={threadId}
          remaining={quota.remaining}
          limit={quota.limit}
          onUserSend={handleUserSend}
          onSent={handleSent}
        />
      </section>
    </div>
  );
}
