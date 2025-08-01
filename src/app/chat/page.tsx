"use client";

import { useState } from "react";
import ChatLayout from "@/components/ChatLayout";

interface Msg {
  id   : string;
  role : "user" | "assistant";
  text : string;
}

export default function ChatIndex() {
  const userId: string | null = null;          // lấy từ session nếu đăng nhập
  const [messages, setMessages] = useState<Msg[]>([]);

  function handleSent(d: { assistantReply: string; threadId: string; userMsg: string }) {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user",      text: d.userMsg },
      { id: crypto.randomUUID(), role: "assistant", text: d.assistantReply },
    ]);
  }

  return (
    <ChatLayout userId={userId} onSent={handleSent}>
      {messages.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          Chọn một cuộc trò chuyện ở bên trái hoặc tạo mới.
        </p>
      ) : (
        messages.map((m) => (
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
        ))
      )}
    </ChatLayout>
  );
}
