/*  app/chat/[id]/page.tsx  */
"use client";

import useSWR from "swr";
import ChatLayout from "@/components/ChatLayout";

interface MsgRow {
  id       : string;
  role     : "user" | "assistant";
  content  : string;
  created_at: string;
}

/* api helper */
const fetchMessages = async (id: string) => {
  const r = await fetch(`/api/chat/messages?threadId=${id}`);
  if (!r.ok) throw new Error("Cannot load messages");
  return (await r.json()) as MsgRow[];
};

export default function ChatThread({ params }: { params: { id: string } }) {
  const userId: string | null = null;            // lấy session nếu cần
  const { data, error, isLoading, mutate } = useSWR(
    params.id ? ["msgs", params.id] : null,
    () => fetchMessages(params.id)
  );

  return (
    <ChatLayout userId={userId} onSent={() => mutate()}>
      {isLoading && <p className="text-sm text-muted-foreground">Đang tải…</p>}

      {error && (
        <p className="text-sm text-red-500">Không thể tải tin nhắn.</p>
      )}

      {!!data?.length &&
        data.map((m) => (
          <div
            key={m.id}
            className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
              m.role === "user"
                ? "ml-auto bg-violet-500 text-white"
                : "mr-auto bg-muted"
            }`}
          >
            {m.content}
          </div>
        ))}

      {!isLoading && !data?.length && (
        <p className="text-center text-sm text-muted-foreground">
          Chưa có tin nhắn. Hãy bắt đầu trò chuyện!
        </p>
      )}
    </ChatLayout>
  );
}
