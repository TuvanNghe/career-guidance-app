// src/components/MessageInput.tsx
"use client";

import { useState, useRef, FormEvent } from "react";
import { ArrowUpCircle } from "lucide-react";

interface MessageInputProps {
  userId: string | null;
  threadId?: string;
  remaining?: number;
  limit?: number;
  onUserSend?: (userText: string, localId: number) => void;
  onSent?: (newThreadId: string, assistantReply: string, localId: number) => void;
}

const isUUIDv4 = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

export default function MessageInput({
  userId,
  threadId,
  remaining = 100,
  limit = 100,
  onUserSend,
  onSent,
}: MessageInputProps) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = value.trim();
    if (!text || sending) return;
    if (remaining <= 0) return;

    const localId = Date.now() + Math.floor(Math.random() * 1000);

    onUserSend?.(text, localId);

    setValue("");
    inputRef.current?.focus();

    setSending(true);
    try {
      const payload: Record<string, any> = { userId, content: text };
      if (threadId && isUUIDv4(threadId)) payload.threadId = threadId;

      const res = await fetch("/api/chat/send", {
        method: "POST",
        credentials: "include", // ✅ mang theo cookie
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = "Xin lỗi, bạn chưa đăng nhập!";
        try {
          const j = await res.json();
          if (j?.message) msg = j.message;
        } catch {}
        onSent?.(threadId ?? "", msg, localId);
        return;
      }

      const { threadId: newId, content: assistantReply } = await res.json();
      onSent?.(newId, assistantReply, localId);
    } catch (err) {
      console.error("Send message failed:", err);
      onSent?.(
        threadId ?? "",
        "Xin lỗi, đang gặp sự cố. Liên hệ quản trị viên hoặc Bạn thử lại giúp mình nhé!",
        localId
      );
    } finally {
      setSending(false);
    }
  }

  const disabled = sending || !value.trim() || remaining <= 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-4 mb-4 flex items-center gap-3 rounded-full border bg-white px-4 py-2 shadow-sm"
    >
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={
          remaining > 0 ? "Hỏi huongnghiep.ai" : `Bạn đã dùng hết ${limit} tin nhắn`
        }
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />

      <span
        className={`text-[11px] ${
          remaining <= 5 ? "text-red-600" : "text-muted-foreground"
        } shrink-0`}
      >
        {Math.max(remaining, 0)}/{limit}
      </span>

      <button
        type="submit"
        disabled={disabled}
        className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
          disabled
            ? "cursor-not-allowed bg-muted text-muted-foreground"
            : "bg-violet-500 text-white hover:bg-violet-600"
        }`}
        aria-label="Gửi"
        title={remaining <= 0 ? "Bạn đã dùng hết quota" : "Gửi"}
      >
        <ArrowUpCircle className="h-5 w-5" />
      </button>
    </form>
  );
}
