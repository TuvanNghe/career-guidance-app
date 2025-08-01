/* --------------  HomePage  -------------- */
"use client";

import Link from "next/link";
import { SERVICE, PRICES } from "@/lib/constants";

export const dynamic = "force-dynamic";
/* Counter ô thống kê nhỏ */
const Counter = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center gap-1">
    <span className="text-3xl font-extrabold">{value}</span>
    <span className="text-sm text-gray-500">{label}</span>
  </div>
);

export default function HomePage() {
  /* Giá combo hiển thị */
  const combo = PRICES.combo.toLocaleString("vi-VN");

  return (
    <main className="space-y-24">
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden bg-indigo-50 py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-bold leading-tight">
            Nền tảng <span className="text-indigo-600">Hướng nghiệp AI</span>
          </h1>
          <p className="mt-4 text-gray-600">
            Không biết mình hợp ngành gì? Phân vân giữa đam mê và thực tế?
            Đừng lo! Hướng nghiệp AI giúp bạn tự hiểu bản thân nhanh chóng qua các bài test MBTI, Holland và Giá trị cá nhân – tất cả chỉ mất vài phút. Với công nghệ AI hiện đại, nền tảng sẽ phân tích kết quả và tạo ra báo cáo chuyên sâu, cực kỳ dễ hiểu và sát với bạn. Không chỉ “nói bạn là ai”, hệ thống còn gợi ý ngành nghề phù hợp, giúp bạn định hình hướng đi rõ ràng cho học tập và sự nghiệp.
            Dễ dùng – Nhanh chóng – Cá nhân hóa.
            Dù bạn đang là học sinh, sinh viên hay người đang tìm hướng đi mới, Hướng nghiệp AI luôn sẵn sàng đồng hành.

            Bắt đầu khám phá chính mình hôm nay – Để mai này không chọn sai đường!.
          </p>
          <Link
            href="/mbti"
            className="mt-8 inline-block rounded-xl bg-indigo-600 px-8 py-3 text-white shadow hover:bg-indigo-700"
          >
            Bắt đầu miễn phí
          </Link>
          {/* hình minh hoạ */}
          <img
            src="/hero-career.svg"
            alt=""
            className="mx-auto mt-12 max-w-xl"
          />
        </div>
      </section>

      {/* ---------- 4 Ô dịch vụ ---------- */}
      <section className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-2xl font-semibold">
          Các công cụ đánh giá
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-5">
          {[
            { key: SERVICE.MBTI, label: "MBTI", desc: "60 câu hỏi • Miễn phí" },
            { key: SERVICE.HOLLAND, label: "Holland", desc: "54 câu hỏi • 20 K" },
            { key: SERVICE.KNOWDELL, label: "Giá trị bản thân", desc: "54 thẻ • 100 K" },
            { key: "chat", label: "Chatbot A.I", desc: "Tư vấn A.I & FAQ" },
            { key: "phongtran", label: "Tư vấn 1-1", desc: "Tư vấn trực tiếp với chuyên gia" },
          ].map(card => (
            <Link
              key={card.key}
              href={card.key === "chat" ? "/chat" : `/${card.key}`}
              className="
                flex flex-col items-center rounded-2xl border p-6
                shadow-sm transition hover:-translate-y-1 hover:shadow-md
              "
            >
              <span className="text-xl font-bold">{card.label}</span>
              <p className="mt-2 text-sm text-gray-500">{card.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- USP 3 cột ---------- */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-2xl font-semibold">
            Vì sao chọn chúng tôi?
          </h2>

          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {[
              {
                title: "Phương pháp khoa học",
                desc: "Kết hợp các lý thuyết hướng nghiệp quốc tế & dữ liệu AI.",
              },
              {
                title: "Cá nhân hoá 100 %",
                desc: "Báo cáo được tạo riêng cho bạn, nêu rõ điểm mạnh & phù hợp nghề.",
              },
              {
                title: "Hồ sơ phát triển sự nghiệp",
                desc: "Dễ dàng đọc lại.",
              },
            ].map(item => (
              <div key={item.title} className="space-y-2 text-center">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Counters ---------- */}
      <section className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-2xl font-semibold">Những con số nổi bật</h2>
        <div className="mt-8 flex flex-wrap justify-center gap-10">
          <Counter value="120+" label="Người dùng" />
          <Counter value="250+" label="Bài test đã hoàn thành" />
          <Counter value="99+" label="Báo cáo đã tạo" />
        </div>
      </section>

      {/* ---------- Bảng giá đơn & combo ---------- */}
      <section className="bg-indigo-50 py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-2xl font-semibold">Bảng giá</h2>

          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {[
              { label: "MBTI", price: PRICES.mbti },
              { label: "Holland", price: PRICES.holland },
              { label: "Knowdell", price: PRICES.knowdell },
              { label: "Combo 3 công cụ", price: PRICES.combo },
            ].map(p => (
              <div
                key={p.label}
                className="flex flex-col items-center rounded-2xl bg-white p-6 shadow-sm"
              >
                <span className="text-xl font-bold">{p.label}</span>
                <span className="mt-2 text-3xl font-extrabold text-indigo-600">
                  {p.price.toLocaleString("vi-VN")} đ
                </span>
                <Link
                  href={
                    p.label.startsWith("Combo")
                      ? `/payment?product=knowdell`
                      : `/payment?product=${p.label.toLowerCase()}`
                  }
                  className="mt-6 w-full rounded bg-indigo-600 py-2 text-white hover:bg-indigo-700"
                >
                  Đăng ký
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FAQ Accordion đơn giản ---------- */}
      <section className="mx-auto max-w-3xl px-6">
        <h2 className="text-center text-2xl font-semibold">Câu hỏi thường gặp</h2>

        <details className="mt-6 rounded border p-4">
          <summary className="cursor-pointer font-medium">
            Tôi nên bắt đầu với công cụ nào trước?
          </summary>
          <p className="mt-2 text-sm text-gray-600">
            Bạn có thể làm MBTI hoặc Holland trước để hiểu tính cách/sở thích,
            sau đó dùng Knowdell đào sâu giá trị trước khi ra quyết định nghề nghiệp.
          </p>
        </details>

        <details className="mt-4 rounded border p-4">
          <summary className="cursor-pointer font-medium">
            Sau khi thanh toán tôi nhận báo cáo ở đâu?
          </summary>
          <p className="mt-2 text-sm text-gray-600">
            Báo cáo lưu trong mục “Hồ sơ” trên website.
          </p>
        </details>

        <details className="mt-4 rounded border p-4">
          <summary className="cursor-pointer font-medium">
            Tại sao nên sử dụng website này để hướng nghiệp?
          </summary>
          <p className="mt-2 text-sm text-gray-600">
            Vì bạn sẽ nhận được phân tích cá nhân hóa bằng AI, dựa trên các trắc nghiệm đã được khoa học kiểm chứng – nhanh, dễ hiểu và sát với bản thân.
          </p>
        </details>

        <details className="mt-4 rounded border p-4">
          <summary className="cursor-pointer font-medium">
            Có nên nhờ gia đình tham khảo kết quả không?
          </summary>
          <p className="mt-2 text-sm text-gray-600">
            Có chứ! Gia đình hiểu bạn và có kinh nghiệm. Việc tham khảo ý kiến người thân sẽ giúp bạn có thêm góc nhìn để đưa ra quyết định đúng đắn hơn.
          </p>
        </details>

        <details className="mt-4 rounded border p-4">
          <summary className="cursor-pointer font-medium">
            Tôi muốn được tư vấn thêm sau khi có kết quả thì sao?
          </summary>
          <p className="mt-2 text-sm text-gray-600">
            Bạn có thể đăng ký tư vấn 1:1 với chuyên gia hướng nghiệp nếu cần thêm định hướng sâu hơn.
          </p>
        </details>

      </section>

      {/* ---------- CTA cuối ---------- */}
      <section className="bg-indigo-600 py-14 text-center text-white">
        <h2 className="text-2xl font-semibold">
          Sẵn sàng khám phá bản thân & chọn đúng nghề?
        </h2>
        <Link
          href="/mbti"
          className="mt-6 inline-block rounded bg-white/10 px-8 py-3 font-medium hover:bg-white/20"
        >
          Đăng ký ngay
        </Link>
      </section>
    </main>
  );
}
