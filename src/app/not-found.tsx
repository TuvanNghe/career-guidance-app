// src/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold">Không tìm thấy trang</h1>
      <p className="text-muted-foreground max-w-md">
        Trang bạn truy cập không tồn tại hoặc đã được di chuyển.
      </p>

      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-full bg-violet-600 px-4 py-2 text-white hover:bg-violet-700 transition"
        >
          Về trang chủ
        </Link>
        <Link
          href="/chat"
          className="rounded-full border px-4 py-2 hover:bg-gray-50 transition"
        >
          Mở Chatbot
        </Link>
      </div>
    </main>
  );
}
