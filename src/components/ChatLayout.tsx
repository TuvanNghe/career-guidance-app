"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import MessageInput from "./MessageInput";            // ⬅ default import ✨
import HistoryList  from "./HistoryList";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Loader2, MessagesSquare } from "lucide-react";
import useSWR from "swr";

/* ---------- types ---------- */
interface ChatLayoutProps {
  userId: string | null;
  children: React.ReactNode;
}

/* ---------- fetch threads ---------- */
const getThreads = async (userId: string) => {
  const r = await fetch(`/api/chat/threads?userId=${userId}`);
  if (!r.ok) throw new Error("Cannot load threads");
  return (await r.json()) as {
    id: string;
    title: string | null;
    updated_at: string;
  }[];
};

/* ---------- component ---------- */
export default function ChatLayout({ userId, children }: ChatLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: threads, isLoading, mutate } = useSWR(
    userId ? ["threads", userId] : null,
    () => getThreads(userId!)
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threads]);

  return (
    <div className="grid h-[calc(100vh-48px)] grid-cols-[260px_1fr]">
      {/* sidebar */}
      <aside className="flex h-full flex-col border-r">
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
              activeId={pathname.split("/").pop()!}
              onSelect={(id) => router.push(`/chat/${id}`)}
              onDelete={async () => {
                await mutate();
                if (pathname === "/chat") router.refresh();
              }}
            />
          )}

          <div ref={bottomRef} />
        </ScrollArea>
      </aside>

      {/* chat pane */}
      <section className="relative flex h-full flex-col">
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">{children}</div>
        <MessageInput userId={userId}
  threadId={pathname.split("/").pop()!}   // activeId
  onSent={() => mutate()} />
      </section>
    </div>
  );
}
