"use client";

import { useState } from "react";
import MessageInput from "@/components/MessageInput";

interface Msg {
  id   : string;
  role : "user" | "assistant";
  text : string;
}

export default function ChatPage() {
  const [threadId, setThreadId] = useState<string>();
  const [messages, setMessages] = useState<Msg[]>([]);

  /* callback khi gửi thành công */
  function handleSent(data: { assistantReply: string; threadId: string; userMsg: string }) {
    setThreadId((prev) => prev ?? data.threadId);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user",      text: data.userMsg },
      { id: crypto.randomUUID(), role: "assistant", text: data.assistantReply },
    ]);
  }

  return (
    /* KHÔNG thay đổi wrapper bên ngoài của bạn – chỉ cần khung con này có h-full */
    <div className="flex h-full flex-col">
      {/* Danh sách tin nhắn chiếm toàn bộ chiều cao còn lại */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
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

      {/* Ô nhập luôn dính đáy – không margin-top, không margin-bottom trừ px */}
      <div className="sticky bottom-0 bg-background">
        <MessageInput
          userId={null}
          threadId={threadId}
          onSent={handleSent}
        />
      </div>
    </div>
  );
}
