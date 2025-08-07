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
  if (messages.length === 0) {
    return (
      <div className="rounded-lg bg-gray-100 p-4 text-sm text-gray-700 max-w-[80%]">
        Xin chào, tôi là trợ lý Seven, tôi sẽ hỗ trợ bạn trong các vấn đề liên quan đến hướng nghiệp, nghề nghiệp.
      </div>
    );
  }

  return (
    <>
      {messages.map((m, i) => (
        <div
          key={i}
          className={`max-w-[80%] rounded-lg px-3 py-2 ${
            m.role === "user"
              ? "self-end bg-violet-500 text-white"
              : "bg-muted text-gray-800"
          }`}
        >
          {m.content}
        </div>
      ))}
    </>
  );
}
