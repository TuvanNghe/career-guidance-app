// app/page.tsx
import React from "react";
import Image from "next/image";
import type { Metadata } from "next";
import {
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  PlayCircleIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon, StarIcon } from "@heroicons/react/24/solid";

export const metadata: Metadata = {
  title: "Coaching nghề nghiệp 1–1 | Trần Thanh Phong – HRBP & Career Mentor",
  description:
    "Chương trình 1–1 giúp bạn rõ nghề – rõ lộ trình – rõ việc làm. Cá nhân hoá theo Holland/Knowdell, kèm sửa CV & phỏng vấn giả định.",
  openGraph: {
    title: "Coaching nghề nghiệp 1–1 | Trần Thanh Phong",
    description:
      "Rõ nghề trong 4 tuần. Kèm CV, mock interview & roadmap 6–12 tháng.",
    type: "website",
  },
  alternates: { canonical: "/" },
};

export default function PhongTranProfile() {
  // --- JSON-LD (SEO) ---
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Trần Thanh Phong",
    jobTitle: "HRBP Manager & Career Mentor",
    image: "/avatar-phongtran.jpg",
    sameAs: ["https://facebook.com/kyvophong"],
    makesOffer: {
      "@type": "Offer",
      name: "Coaching nghề nghiệp 1–1 (4 tuần)",
      priceCurrency: "VND",
      price: "799000",
      availability: "https://schema.org/InStock",
      url: "tel:0919122225",
    },
  };

  return (
    <main className="bg-white text-gray-800">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO – tập trung 1–1 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-indigo-50">
        <div className="container mx-auto grid items-center gap-10 px-6 py-20 md:grid-cols-2 md:py-28">
          <div className="order-2 md:order-1">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700">
              <ShieldCheckIcon className="h-5 w-5" />
              Coaching 1–1 cá nhân hoá
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight text-indigo-900 md:text-5xl">
              Rõ nghề trong <span className="text-indigo-600">4 tuần</span>, cùng
              chuyên gia HR
            </h1>
            <p className="mt-4 text-lg text-gray-700">
              Kết hợp kinh nghiệm <b>12+ năm HRBP</b> với bộ công cụ Holland/
              Knowdell. Nhận <b>roadmap 6–12 tháng</b>, kèm <b>sửa CV</b> và{" "}
              <b>mock interview</b>.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#booking"
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-700"
              >
                Đặt lịch tư vấn 1–1 <ArrowRightIcon className="h-5 w-5" />
              </a>
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 rounded-full border border-indigo-300 px-6 py-3 font-semibold text-indigo-700 hover:bg-indigo-50"
              >
                Xem bảng giá
              </a>
            </div>

            {/* Trust signals */}
            <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                100+ mentee hài lòng
              </div>
              <div className="flex items-center gap-2">
                <CalendarDaysIcon className="h-5 w-5 text-indigo-600" />
                Lịch linh hoạt tối/ cuối tuần
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5 text-indigo-600" />
                Cam kết rõ kết quả
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="relative mx-auto h-64 w-64 overflow-hidden rounded-full shadow-2xl ring-8 ring-white md:h-80 md:w-80">
              <Image
                src="/avatar-phongtran.jpg"
                alt="Trần Thanh Phong – HRBP & Career Mentor"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* WHY 1–1 */}
      <section id="coaching" className="bg-indigo-50/60">
        <div className="container mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-center text-3xl font-bold text-indigo-800">
            Vì sao 1–1 hiệu quả?
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Cá nhân hoá theo tính cách",
                desc: "Dùng Holland + Knowdell để hiểu tiềm năng, giá trị & động lực của bạn.",
                icon: RocketLaunchIcon,
              },
              {
                title: "Kèm thực chiến HR",
                desc: "Sửa CV, mock interview, chiến lược tìm việc theo thị trường thật.",
                icon: ShieldCheckIcon,
              },
              {
                title: "Roadmap rõ ràng",
                desc: "Nhận lộ trình 6–12 tháng, checklist từng tuần & tài nguyên học.",
                icon: CalendarDaysIcon,
              },
            ].map((b) => (
              <div
                key={b.title}
                className="rounded-3xl bg-white p-8 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                  <b.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold text-indigo-900">
                  {b.title}
                </h3>
                <p className="mt-2 text-gray-600">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KẾT QUẢ NHẬN ĐƯỢC */}
      <section className="container mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-3xl font-bold text-indigo-800">
          Bạn nhận được gì sau chương trình?
        </h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            "Bản đồ nghề cá nhân (Holland/Knowdell) + năng lực lõi",
            "CV chuẩn ATS thu hút",
            "Kịch bản trả lời 20+ câu hỏi phỏng vấn khó",
            "Roadmap 6–12 tháng (skill, dự án, portfolio)",
            "Bộ template email, theo dõi ứng tuyển, checklist",
            "Support 30 ngày sau khoá học qua Zalo",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <CheckCircleIcon className="mt-1 h-5 w-5 shrink-0 text-green-600" />
              <span className="text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* PRICING */}
      <section id="pricing" className="bg-indigo-50 py-20">
        <div className="container mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-indigo-800">
            Bảng giá & gói dịch vụ 1–1
          </h2>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {/* CV PRO */}
            <div className="rounded-3xl bg-white p-8 shadow-md">
              <h3 className="text-xl font-semibold text-indigo-900">CV Pro</h3>
              <p className="mt-1 text-sm text-gray-600">
                Sửa CV chuyên sâu + thư ứng tuyển
              </p>
              <div className="mt-4 text-3xl font-extrabold text-indigo-700">
                100.000đ
              </div>
              <ul className="mt-6 space-y-2 text-gray-700">
                {[
                  "Phân tích JD & chọn từ khoá ATS",
                  "Góp ý bố cục, định lượng thành tựu",
                  "Template thư ứng tuyển",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircleIcon className="mt-1 h-5 w-5 text-green-600" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#booking"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-indigo-300 px-4 py-3 font-semibold text-indigo-700 hover:bg-indigo-50"
              >
                Đặt gói này
              </a>
            </div>

            {/* INTERVIEW PRO */}
            <div className="rounded-3xl bg-white p-8 shadow-md">
              <h3 className="text-xl font-semibold text-indigo-900">
                Interview Pro
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Phỏng vấn thử 60–90’, nhận nhận xét chi tiết
              </p>
              <div className="mt-4 text-3xl font-extrabold text-indigo-700">
                200.000đ
              </div>
              <ul className="mt-6 space-y-2 text-gray-700">
                {[
                  "Mock interview theo vị trí của bạn",
                  "Kịch bản trả lời STAR/CARE",
                  "Checklist trước – trong – sau PV",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircleIcon className="mt-1 h-5 w-5 text-green-600" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#booking"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-indigo-300 px-4 py-3 font-semibold text-indigo-700 hover:bg-indigo-50"
              >
                Đặt gói này
              </a>
            </div>

            {/* CAREER 1–1 – popular */}
            <div className="relative rounded-3xl bg-white p-8 shadow-xl ring-2 ring-indigo-600">
              <span className="absolute -top-3 right-6 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                Khuyến nghị
              </span>
              <h3 className="text-xl font-semibold text-indigo-900">
                Career 1–1 (4 tuần)
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Định hướng nghề – đổi việc – thăng tiến
              </p>
              <div className="mt-4 text-3xl font-extrabold text-indigo-700">
                799.000đ
              </div>
              <ul className="mt-6 space-y-2 text-gray-700">
                {[
                  "Đánh giá Holland & bộ thẻ giá trị Knowdell",
                  "2 buổi/tuần × 60–90’ (online)",
                  "CV + mock interview",
                  "Roadmap 6–12 tháng & tài liệu học",
                  "Hỗ trợ Zalo 30 ngày sau khoá",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircleIcon className="mt-1 h-5 w-5 text-green-600" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#booking"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow hover:bg-indigo-700"
              >
                Bắt đầu 1–1 ngay
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-bold text-indigo-800">
          Học viên nói gì?
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              name: "Thảo N.",
              text:
                "Sau 3 tuần mình có offer đúng ngành, CV được sửa rất kỹ và mock interview cực hữu ích.",
            },
            {
              name: "Duy P.",
              text:
                "Bản đồ nghề + roadmap giúp mình chuyển ngành mượt. Mentor theo sát và có bài tập rõ ràng.",
            },
            {
              name: "Lan H.",
              text:
                "Nhiệt tình, thực tế từ góc nhìn HR. Bộ câu hỏi phỏng vấn giúp tự tin thấy rõ.",
            },
          ].map((t) => (
            <figure
              key={t.name}
              className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                ))}
              </div>
              <blockquote className="mt-3 text-gray-700">{t.text}</blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-indigo-900">
                {t.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* HÀNH TRÌNH SỰ NGHIỆP (giữ gọn) */}
      <section className="bg-indigo-50 py-16">
        <div className="container mx-auto max-w-4xl space-y-10 px-6">
          <h2 className="text-center text-3xl font-bold text-indigo-800">
            Hành trình sự nghiệp
          </h2>
          <ul className="relative border-l-2 border-indigo-300 pl-8">
            {[
              {
                time: "2023–2025",
                role: "HR Manager – JTExpress",
                desc: "Tái cấu trúc, tiết kiệm 3 tỷ ₫ chi phí; quản lý 5.000 nhân sự",
              },
              {
                time: "2017–2022",
                role: "HR Manager – PGS Group",
                desc: "Mở 6 chi nhánh; quy mô tăng 270 → 1.000; tuyển–đào tạo–truyền lửa",
              },
              {
                time: "2014–2017",
                role: "HR Lead – E.Land / TC Garment",
                desc: "Triển khai phần mềm HR, xây dựng lương sản phẩm",
              },
            ].map((e, i) => (
              <li key={i} className="mb-8 relative">
                <span className="absolute -left-4 top-1 flex h-3 w-3 items-center justify-center rounded-full bg-indigo-600 ring-4 ring-indigo-100">
                  <span className="block h-2 w-2 rounded-full bg-white" />
                </span>
                <div>
                  <div className="font-semibold text-indigo-800">{e.time}</div>
                  <div className="mt-1 font-medium">{e.role}</div>
                  <p className="mt-2 text-gray-600">{e.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ (không cần JS) */}
      <section className="container mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-3xl font-bold text-indigo-800">Câu hỏi thường gặp</h2>
        <div className="mt-6 space-y-3">
          {[
            {
              q: "Mình chưa định hình nghề, có phù hợp không?",
              a: "Rất phù hợp. Buổi 1–2 tập trung khám phá tính cách, năng lực & giá trị, sau đó mới chốt hướng đi khả thi.",
            },
            {
              q: "Không có nhiều thời gian thì sao?",
              a: "Lịch linh hoạt tối/ cuối tuần. Mỗi tuần 2 buổi × 60–90’, kèm bài tập ngắn gọn, có mẫu để làm nhanh.",
            },
            {
              q: "Nếu sau khoá vẫn chưa rõ thì sao?",
              a: "Có hỗ trợ Zalo 30 ngày & 1 buổi follow-up miễn phí để chốt roadmap.",
            },
          ].map((f, i) => (
            <details
              key={i}
              className="group rounded-2xl border border-indigo-100 bg-white p-5 open:shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between text-base font-semibold text-indigo-900">
                {f.q}
                <span className="ml-4 text-indigo-600">+</span>
              </summary>
              <p className="mt-3 text-gray-700">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* QUÀ TẶNG */}
      <section className="container mx-auto max-w-2xl px-6 pb-16">
        <div className="rounded-3xl bg-indigo-600 px-8 py-12 text-center text-white shadow-lg">
          <h2 className="text-3xl font-bold">Quà tặng dành cho bạn</h2>
          <p className="mt-3 text-lg">
            Nhập mã <span className="font-semibold tracking-wider">PT20</span>{" "}
            để giảm 20.000 đ khi mua combo hướng nghiệp.
          </p>
          <a
            href="/payment?product=knowdell"
            className="mt-6 inline-block rounded-full bg-white px-8 py-3 font-semibold text-indigo-700 hover:bg-gray-100"
          >
            Nhận ưu đãi
          </a>
        </div>
      </section>

      {/* BOOKING / CONTACT */}
      <section id="booking" className="bg-gray-50 py-16">
        <div className="container mx-auto grid grid-cols-1 gap-10 px-6 sm:grid-cols-2 md:grid-cols-5">
          {[
            {
              label: "Gọi ngay",
              icon: PhoneIcon,
              href: "tel:0919122225",
              info: "0919 122 225",
              bg: "bg-indigo-600",
            },
            {
              label: "Chat Zalo",
              icon: ChatBubbleLeftRightIcon,
              href: "https://zalo.me/0919122225",
              info: "0919 122 225",
              bg: "bg-sky-500",
            },
            {
              label: "Facebook",
              icon: PlayCircleIcon,
              href: "https://facebook.com/kyvophong",
              info: "/kyvophong",
              bg: "bg-blue-600",
            },
            {
              label: "YouTube (sắp)",
              icon: PlayCircleIcon,
              href: "#",
              info: "Sắp cập nhật",
              bg: "bg-red-600/80",
              disabled: true,
            },
            {
              label: "TikTok (sắp)",
              icon: PlayCircleIcon,
              href: "#",
              info: "Sắp cập nhật",
              bg: "bg-black/80",
              disabled: true,
            },
          ].map((c, i) => (
            <a
              key={i}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center space-y-3 rounded-xl bg-white p-6 shadow transition hover:shadow-lg ${
                // @ts-ignore
                c.disabled ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <div
                className={`${c.bg} flex h-16 w-16 items-center justify-center rounded-full text-white`}
              >
                <c.icon className="h-8 w-8" />
              </div>
              <p className="font-semibold text-indigo-800">{c.label}</p>
              <p className="text-sm text-gray-600">{c.info}</p>
            </a>
          ))}
        </div>
      </section>

      {/* STICKY CTA (mobile) */}
      <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto block md:hidden">
        <a
          href="#booking"
          className="flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white shadow-2xl ring-1 ring-indigo-400/40"
        >
          Đặt lịch tư vấn 1–1 <ArrowRightIcon className="h-5 w-5" />
        </a>
      </div>
    </main>
  );
}
