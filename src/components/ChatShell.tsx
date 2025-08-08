// src/components/ChatShell.tsx
"use client";

interface Msg {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
}

interface Props {
  messages: Msg[];
}

export default function ChatShell({ messages }: Props) {
  if (!messages || messages.length === 0) {
    return (
      <div className="rounded-lg bg-gray-100 p-4 text-sm text-gray-700 max-w-[80%]">
        Xin chào, tôi là trợ lý Seven — mình có thể giúp gì cho bạn về hướng
        nghiệp hôm nay?
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.map((m, i) => {
        const isUser = m.role === "user";
        const isSystem = m.role === "system";

        // Hàng chứa bong bóng tin nhắn: canh phải cho user, trái cho còn lại
        return (
          <div
            key={m.id ?? i}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={[
                "rounded-2xl px-4 py-2 max-w-[75%] whitespace-pre-wrap break-words",
                isUser
                  ? "bg-violet-500 text-white"
                  : isSystem
                  ? "bg-amber-50 text-amber-800 text-sm border border-amber-200"
                  : "bg-gray-100 text-gray-900",
                // đổ bóng nhẹ cho dễ nhìn
                "shadow-sm",
              ].join(" ")}
            >
              {m.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
