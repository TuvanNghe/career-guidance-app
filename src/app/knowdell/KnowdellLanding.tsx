"use client";

import Link from "next/link";
import {
  PuzzlePieceIcon,
  HeartIcon,
  UsersIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

export default function KnowdellLanding() {
  return (
    <main className="pb-24 bg-white text-gray-800">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-yellow-50 to-white py-28">
        <div className="container mx-auto flex flex-col items-center px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Khám phá giá trị cốt lõi với Knowdell
          </h1>
          <p className="max-w-xl mb-8 text-lg text-gray-600">
            Chọn các thẻ đại diện cho giá trị quan trọng nhất của bạn <br />
            <span className="font-medium">Tìm hiểu</span> &nbsp;–&nbsp; bắt đầu ngay!
          </p>

          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-yellow-600 px-6 py-3 text-white font-semibold hover:bg-yellow-700 transition"
          >
            Đăng nhập & bắt đầu
          </Link>
        </div>
      </section>

      {/* Knowdell là gì + lợi ích */}
      <section className="container mx-auto px-6 mt-20 space-y-16">
        <article className="space-y-6">
          <h2 className="text-3xl font-bold">Knowdell Card Sort là gì?</h2>
          <p className="text-gray-700">
            Knowdell Card Sort giúp bạn xác định và ưu tiên các giá trị cá nhân
            thông qua việc chọn và sắp xếp các thẻ giá trị. Điều này hỗ trợ bạn:
          </p>
          <ul className="grid gap-4 md:grid-cols-2">
            {[
              {
                icon: <HeartIcon className="h-6 w-6 text-yellow-600" />,
                title: "Xác định giá trị cốt lõi của bản thân",
              },
              {
                icon: <UsersIcon className="h-6 w-6 text-yellow-600" />,
                title: "Hiểu cách bạn tương tác với môi trường",
              },
              {
                icon: <PuzzlePieceIcon className="h-6 w-6 text-yellow-600" />,
                title: "Xây dựng hồ sơ phát triển nghề nghiệp cá nhân",
              },
              {
                icon: <ChartBarIcon className="h-6 w-6 text-yellow-600" />,
                title: "Lập kế hoạch lộ trình nghề nghiệp dựa trên giá trị",
              },
            ].map(({ icon, title }) => (
              <li
                key={title}
                className="flex items-start gap-3 rounded-lg bg-yellow-50 p-4"
              >
                {icon}
                <span className="font-medium text-gray-800">{title}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      {/* Quy trình 3 bước */}
      <section className="container mx-auto px-6 mt-20 text-center space-y-6">
        <h2 className="text-3xl font-bold">Tham gia chỉ trong 3 bước</h2>
        <ol className="mx-auto grid gap-6 md:grid-cols-3 max-w-4xl">
          {[
            "Đăng nhập tài khoản",
            "Chọn & sắp xếp thẻ giá trị",
            "Nhận hồ sơ phát triển nghề nghiệp",
          ].map((step, idx) => (
            <li
              key={step}
              className="relative rounded-xl border p-6 pt-10"
            >
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-600 text-white font-semibold">
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
