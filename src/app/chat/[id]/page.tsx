"use client";

import useSWR from "swr";
import ChatLayout from "@/components/ChatLayout";

interface MsgRow {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ChatThread({ params }: { params: { id: string } }) {
  /* bạn có thể lấy userId từ useSession() nếu cần */
  const { data, error, isLoading, mutate } = useSWR<MsgRow[]>(
    `/api/chat/messages?threadId=${params.id}`,
    fetcher,
  );

  return (
    <ChatLayout userId={null} onSent={() => mutate()}>
      {isLoading && <p className="text-sm text-muted-foreground">Đang tải…</p>}

      {error && (
        <p className="text-sm text-red-500">Không thể tải tin nhắn ( {error.message} ).</p>
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
