// src/components/ChatLayout.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Loader2,
  PlusCircle,
  MessagesSquare
} from "lucide-react";
import ChatShell    from "./ChatShell";
import MessageInput from "./MessageInput";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Thread {
  id: string;
  title: string | null;
  updated_at: string;
}

interface Msg {
  role: "system" | "user" | "assistant";
  content: string;
}

interface Props {
  userId: string | null;
}

export default function ChatLayout({ userId }: Props) {
  const [threads, setThreads]       = useState<Thread[]>([]);
  const [loadingThreads, setLT]     = useState(false);
  const [threadId, setThreadId]     = useState<string>();
  const [messages, setMessages]     = useState<Msg[]>([]);
  const sidebarEndRef               = useRef<HTMLDivElement>(null);
  const chatEndRef                  = useRef<HTMLDivElement>(null);

  // 1) Load danh sách threads
  useEffect(() => {
    if (!userId) return;
    setLT(true);
    fetch(`/api/chat/threads?userId=${userId}`)
      .then(res => res.json())
      .then((data: Thread[]) => setThreads(data))
      .finally(() => setLT(false));
  }, [userId]);

  // 2) Scroll sidebar xuống cuối khi threads thay đổi
  useEffect(() => {
    sidebarEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threads]);

  // 3) Mở/tải thread
  const openThread = (id?: string) => {
    setThreadId(id);
    if (id) {
      // load history
      fetch(`/api/chat/messages?threadId=${id}`)
        .then(res => res.json())
        .then((msgs: Msg[]) => setMessages(msgs));
    } else {
      // khởi tạo conversation mới
      setMessages([{
        role: "system",
        content:
          "Xin chào, tôi là trợ lý Seven, tôi sẽ hỗ trợ bạn trong các vấn đề liên quan đến hướng nghiệp, nghề nghiệp."
      }]);
    }
    // scroll chat pane
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  // khởi tạo lần đầu
  useEffect(() => {
    openThread(undefined);
  }, []);

  // 4) Khi gửi xong
  const handleSent = (newId: string, assistantReply: string, userText: string) => {
    // thêm thread mới nếu cần
    if (!threads.find(t => t.id === newId)) {
      setThreads(prev => [
        { id: newId, title: null, updated_at: new Date().toISOString() },
        ...prev
      ]);
    }
    setThreadId(newId);
    // append user + assistant
    setMessages(prev => [
      ...prev,
      { role: "user",      content: userText },
      { role: "assistant", content: assistantReply }
    ]);
    // scroll chat
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
          <button
            onClick={() => openThread(undefined)}
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
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
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Bạn chưa có cuộc trò chuyện nào.
            </p>
          )}

          {threads.map((t) => (
            <div
              key={t.id}                                // ← đây là key duy nhất
              onClick={() => openThread(t.id)}
              className={`cursor-pointer px-4 py-2 hover:bg-gray-100 ${
                t.id === threadId ? "bg-gray-200 font-semibold" : ""
              }`}
            >
              {t.title || "Cuộc trò chuyện mới"}
            </div>
          ))}

          <div ref={sidebarEndRef} />
        </ScrollArea>
      </aside>

      {/* Chat pane */}
      <section className="relative flex h-full flex-col">
        <ScrollArea className="flex-1 px-4 py-6 space-y-4">
          <ChatShell messages={messages} />
          <div ref={chatEndRef} />
        </ScrollArea>

        <MessageInput
          userId={userId}
          threadId={threadId}
          onSent={handleSent}
        />
      </section>
    </div>
  );
}
