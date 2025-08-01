"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import useSWR from "swr";

import MessageInput  from "./MessageInput";
import HistoryList   from "./HistoryList";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Loader2, MessagesSquare } from "lucide-react";

/* ---------- types ---------- */
interface ChatLayoutProps {
  userId  : string | null;
  children: React.ReactNode;              // danh sách tin nhắn render bởi page
}

/* ---------- load threads ---------- */
const fetchThreads = async (uid: string) => {
  const r = await fetch(`/api/chat/threads?userId=${uid}`);
  if (!r.ok) throw new Error("Cannot load threads");
  return (await r.json()) as {
    id        : string;
    title     : string | null;
    updated_at: string;
  }[];
};

/* ---------- component ---------- */
export default function ChatLayout({ userId, children }: ChatLayoutProps) {
  const router   = useRouter();
  const pathname = usePathname();                 // /chat         hoặc /chat/<uuid>
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeId = pathname.split("/").pop();     // <uuid> | "chat"

  /* lấy danh sách threads */
  const { data: threads, isLoading, mutate } = useSWR(
    userId ? ["threads", userId] : null,
    () => fetchThreads(userId!)
  );

  /* auto-scroll sidebar khi có dữ liệu mới */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threads]);

  /* helper: mở cuộc trò chuyện */
  const openThread = (id: string) => router.push(`/chat/${id}`);

  return (
    /* 48px là chiều cao header cố định của site */
    <div className="grid flex-1 grid-cols-[260px_1fr]">
      {/* ============ SIDEBAR ============ */}
      <aside className="flex h-full flex-col border-r bg-background">
        <header className="flex items-center justify-between border-b px-4 py-3 text-sm font-medium">
          <span className="inline-flex items-center gap-1">
            <MessagesSquare size={16} /> Đoạn chat
          </span>
          <button
            onClick={() => router.push("/chat?new=1")}
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <PlusCircle size={14} /> Mới
          </button>
        </header>

        <ScrollArea className="flex-1">
          {/* trạng thái tải */}
          {isLoading && (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải…
            </div>
          )}

          {/* không có thread */}
          {!isLoading && threads?.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Bạn chưa có cuộc trò chuyện nào.
            </p>
          )}

          {/* có thread */}
          {!!threads?.length && (
            <HistoryList
              threads={threads}
              activeId={activeId!}
              onSelect={openThread}
              onDelete={async () => {
                await mutate();              // refresh danh sách
                /* nếu vừa xoá thread đang xem → quay về trang /chat */
                if (pathname !== "/chat" && !threads.find(t => t.id === activeId))
                  router.push("/chat");
              }}
            />
          )}

          <div ref={bottomRef} />
        </ScrollArea>
      </aside>

      {/* ============ CHAT PANE ============ */}
      <section className="relative flex h-full flex-col bg-white">
        {/* danh sách tin nhắn */}
        <div className="flex-1 overflow-y-auto space-y-4 px-4 py-6">
          {children}
        </div>

        {/* ô nhập cố định đáy */}
        <div className="sticky bottom-0 border-t bg-background">
          <MessageInput
            userId={userId}
            threadId={pathname === "/chat" ? undefined : activeId} // undefined với cuộc trò chuyện mới
            /* sau khi gửi thành công:
               - mutate để sidebar cập nhật "last message"
               - nếu đang ở /chat (mới) → chuyển sang URL thread mới */
            onSent={(data) => {
              mutate();
              if (pathname === "/chat") openThread(data.threadId);
            }}
          />
        </div>
      </section>
    </div>
  );
}
