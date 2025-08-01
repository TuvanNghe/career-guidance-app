"use client";

import { useState } from "react";
import ChatLayout   from "@/components/ChatLayout";
import MessageInput from "@/components/MessageInput";

interface Msg {
  id   : string;
  role : "user" | "assistant";
  text : string;
}

export default function ChatIndex() {
  /* nếu có Supabase session hãy lấy userId; demo để null */
  const userId: string | null = null;

  /* local preview (khi ở /chat, chưa có thread) */
  const [threadId, setThreadId] = useState<string>();
  const [messages, setMessages] = useState<Msg[]>([]);

  function handleSent(d: { assistantReply: string; threadId: string; userMsg: string }) {
    setThreadId((prev) => prev ?? d.threadId);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user",      text: d.userMsg },
      { id: crypto.randomUUID(), role: "assistant", text: d.assistantReply },
    ]);
  }

  return (
    <ChatLayout userId={userId}>
      {/* children hiển thị bảng chat tạm ở trang /chat */}
      <div className="flex h-full flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                m.role === "user"
                  ? "ml-auto bg-violet-500 text-white"
                  : "mr-auto bg-muted"
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 bg-background">
          <MessageInput
            userId={userId}
            threadId={threadId}
            onSent={handleSent}
          />
        </div>
      </div>
    </ChatLayout>
  );
}
