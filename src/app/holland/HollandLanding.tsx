"use client";

import Link from "next/link";
import {
  CubeIcon,
  AcademicCapIcon,
  LightBulbIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

export default function HollandLanding() {
  return (
    <main className="pb-24 bg-white text-gray-800">
      {/* ====== Hero + CTA ====== */}
      <section className="relative bg-gradient-to-br from-green-50 to-white py-28">
        <div className="container mx-auto flex flex-col items-center px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Khám phá sở thích nghề nghiệp với Holland
          </h1>
          <p className="max-w-xl mb-8 text-lg text-gray-600">
            54 câu hỏi • 3 phút • Hiểu rõ 6 nhóm nghề theo RIASEC
            <br />
            <span className="font-medium">Tìm hiểu</span> – bắt đầu ngay!
          </p>

          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 text-white font-semibold hover:bg-green-700 transition"
          >
            Đăng nhập & bắt đầu
          </Link>
        </div>
      </section>

      {/* ====== Holland là gì + lợi ích ====== */}
      <section className="container mx-auto px-6 mt-20 space-y-16">
        <article className="space-y-6">
          <h2 className="text-3xl font-bold">Holland Test là gì?</h2>
          <p className="text-gray-700">
            Holland (RIASEC) phân loại sở thích nghề nghiệp thành 6 nhóm:
            <strong> Realistic, Investigative, Artistic, Social, Enterprising, Conventional</strong>. 
            Biết nhóm sở thích giúp bạn:
          </p>
          <ul className="grid gap-4 md:grid-cols-2">
            {[
              {
                icon: <CubeIcon className="h-6 w-6 text-green-600" />,
                title: "Nhận diện môi trường làm việc phù hợp",
              },
              {
                icon: <AcademicCapIcon className="h-6 w-6 text-green-600" />,
                title: "Chọn ngành & kỹ năng cần phát triển",
              },
              {
                icon: <UsersIcon className="h-6 w-6 text-green-600" />,
                title: "Xác định nhóm nghề tiềm năng",
              },
              {
                icon: <LightBulbIcon className="h-6 w-6 text-green-600" />,
                title: "Tăng tính tự tin khi quyết định nghề nghiệp",
              },
            ].map(({ icon, title }) => (
              <li
                key={title}
                className="flex items-start gap-3 rounded-lg bg-green-50 p-4"
              >
                {icon}
                <span className="font-medium text-gray-800">{title}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      {/* ====== Quy trình 3 bước ====== */}
      <section className="container mx-auto px-6 mt-20 text-center space-y-6">
        <h2 className="text-3xl font-bold">Tham gia chỉ trong 3 bước</h2>
        <ol className="mx-auto grid gap-6 md:grid-cols-3 max-w-4xl">
          {[
            "Đăng nhập tài khoản",
            "Trả lời 54 câu hỏi Holland",
            "Nhận kết quả & gợi ý nghề nghiệp",
          ].map((step, idx) => (
            <li
              key={step}
              className="relative rounded-xl border p-6 pt-10"
            >
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white font-semibold">
                {idx + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
