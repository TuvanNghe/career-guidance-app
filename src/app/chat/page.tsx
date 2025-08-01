"use client";

import { useState, useEffect } from "react";
import MessageInput from "@/components/MessageInput";

/* Kiểu đơn giản của message */
interface Msg {
  id    : string;        // random để React key
  role  : "user" | "assistant";
  text  : string;
}

export default function ChatPage() {
  const [threadId, setThreadId] = useState<string>();
  const [messages, setMessages] = useState<Msg[]>([]);

  /* sau khi MessageInput gửi thành công */
  function handleSent(data: { assistantReply: string; threadId: string; userMsg: string }) {
    setThreadId((prev) => prev ?? data.threadId); // lưu uuid lần đầu
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user",       text: data.userMsg },
      { id: crypto.randomUUID(), role: "assistant",  text: data.assistantReply },
    ]);
  }

  /* UI */
  return (
    <div className="flex h-full flex-col">
      {/* --------- message list --------- */}
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

      {/* --------- input --------- */}
      <MessageInput
        userId={null /* hoặc session?.user.id */}
        threadId={threadId}
        onSent={handleSent}
      />
    </div>
  );
}
