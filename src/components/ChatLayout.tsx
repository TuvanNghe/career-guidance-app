"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import useSWR from "swr";

import MessageInput  from "./MessageInput";
import HistoryList   from "./HistoryList";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Loader2, MessagesSquare } from "lucide-react";

interface ChatLayoutProps {
  userId  : string | null;
  children: React.ReactNode;                                // message list
  onSent? : (d: { assistantReply: string; threadId: string; userMsg: string }) => void; // callback lên page
}

/* fetch threads */
const fetchThreads = async (uid: string) => {
  const r = await fetch(`/api/chat/threads?userId=${uid}`);
  if (!r.ok) throw new Error("Cannot load threads");
  return (await r.json()) as {
    id        : string;
    title     : string | null;
    updated_at: string;
  }[];
};

export default function ChatLayout({ userId, children, onSent }: ChatLayoutProps) {
  const router     = useRouter();
  const pathname   = usePathname();            // /chat hoặc /chat/<uuid>
  const bottomRef  = useRef<HTMLDivElement>(null);
  const activeId   = pathname.split("/").pop(); // <uuid> | "chat"

  /* threads */
  const { data: threads, isLoading, mutate } = useSWR(
    userId ? ["threads", userId] : null,
    () => fetchThreads(userId!)
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threads]);

  const openThread = (id: string) => router.push(`/chat/${id}`);

  return (
    <div className="grid min-h-[calc(100vh-48px)] grid-cols-[260px_1fr]">
      {/* ───── Sidebar ───── */}
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
          {isLoading && (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải…
            </div>
          )}

          {!isLoading && threads?.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Bạn chưa có cuộc trò chuyện nào.
            </p>
          )}

          {!!threads?.length && (
            <HistoryList
              threads={threads}
              activeId={activeId!}
              onSelect={openThread}
              onDelete={async () => {
                await mutate();
                if (pathname !== "/chat" && !threads.find(t => t.id === activeId))
                  router.push("/chat");
              }}
            />
          )}

          <div ref={bottomRef} />
        </ScrollArea>
      </aside>

      {/* ───── Chat pane ───── */}
      <section className="relative flex h-full flex-col bg-white">
        <div className="flex-1 overflow-y-auto space-y-4 px-4 py-6">{children}</div>

        <div className="sticky bottom-0 border-t bg-background">
          <MessageInput
            userId={userId}
            threadId={pathname === "/chat" ? undefined : activeId}
            onSent={(data) => {
              mutate();                // refresh sidebar
              onSent?.(data);          // báo ngược ra page
              if (pathname === "/chat") openThread(data.threadId);
            }}
          />
        </div>
      </section>
    </div>
  );
}
