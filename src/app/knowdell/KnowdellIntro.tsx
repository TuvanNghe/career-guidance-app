"use client";

import { useRouter } from "next/navigation";
import { SERVICE } from "@/lib/constants";

type Props = {
  hasPaid: boolean;
  hasResult: boolean;
};

const PRICE = 100_000;

/* Ô thống kê nhỏ */
const StatBox = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center rounded-xl border p-6 shadow-sm">
    <span className="text-3xl font-extrabold">{value}</span>
    <span className="mt-1 text-sm text-gray-500">{label}</span>
  </div>
);

export default function KnowdellIntro({ hasPaid, hasResult }: Props) {
  const router = useRouter();

  const onStart = () => {
    if (hasResult) {
      router.push("/profile");                 // đã hoàn thành
    } else if (hasPaid) {
      router.push("/knowdell/quiz");           // đã trả tiền
    } else {
      router.push(`/payment?product=${SERVICE.KNOWDELL}`); // chưa trả
    }
  };

  return (
    <main className="mx-auto max-w-lg px-6 py-12 text-center space-y-10">
      {/* Tiêu đề & mô tả */}
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">
          Bộ thẻ Giá trị Bản thân Knowdell
        </h1>
        <p className="text-gray-600">
          Chọn 10/54 thẻ giá trị để xác định điều bạn coi trọng nhất trong công việc.
        </p>
      </header>

      {/* 3 ô thống kê */}
      <section className="grid grid-cols-3 gap-4">
        <StatBox value="54"   label="Thẻ" />
        <StatBox value="10"   label="Chọn" />
        <StatBox value="100K" label="Phí" />
      </section>

      {/* Quy trình */}
      <section className="rounded-xl border border-dashed p-6 text-left leading-6">
        <h2 className="font-semibold mb-2">Quy trình:</h2>
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            <b>Thanh toán</b> {PRICE.toLocaleString()} đ phí (bằng QR tại trang thanh toán)
          </li>
          <li>
            <b>Kéo-thả</b> 10 thẻ giá trị quan trọng nhất với bạn
          </li>
          <li>
            <b>Kết quả</b> sẽ được lưu vào Hồ sơ Nghề nghiệp
          </li>
        </ol>
      </section>

      {/* Nút hành động */}
      <button
        onClick={onStart}
        className="
          w-full rounded-xl border-2 border-indigo-600 bg-indigo-600/90
          px-6 py-3 font-medium text-white transition
          hover:bg-indigo-600
        "
      >
        {hasResult
          ? "Xem kết quả Knowdell"
          : hasPaid
          ? "Bắt đầu Quiz Knowdell"
          : `Thanh toán ${PRICE.toLocaleString()} đ`}
      </button>
    </main>
  );
}
