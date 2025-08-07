// src/app/chat/page.tsx
import ChatLayout from "@/components/ChatLayout";

export default function ChatPage() {
  // TODO: nếu bạn có hệ thống auth, lấy userId ở đây
  const userId = null;

  return <ChatLayout userId={userId} />;
}
