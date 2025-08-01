"use client";

import useSWR from "swr";
import ChatLayout from "@/components/ChatLayout";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

interface MsgRow {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export default function ChatThread({ params }: { params: { id: string } }) {
  const supabase = useSupabaseClient();                // ✨ client đã login
  const threadId = params.id;

  /* fetcher trực tiếp từ Supabase */
  const fetcher = async (id: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("id, role, content, created_at")
      .eq("thread_id", id)
      .order("created_at");
    if (error) throw error;
    return data as MsgRow[];
  };

  const { data, error, isLoading, mutate } = useSWR(
    threadId ? ["msgs", threadId] : null,
    () => fetcher(threadId)
  );

  return (
    <ChatLayout userId={null} onSent={() => mutate()}>
      {isLoading && <p className="text-sm text-muted-foreground">Đang tải…</p>}

      {error && (
        <p className="text-sm text-red-500">Không thể tải tin nhắn ({error.message}).</p>
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
