// src/app/loading.tsx
export default function Loading() {
  // Fallback toàn cục cho mọi route khi client khởi động (Suspense boundary root)
  return (
    <div className="flex h-[60vh] items-center justify-center text-sm text-muted-foreground">
      Đang tải…
    </div>
  );
}
