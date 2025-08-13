'use client';

import { useRouter } from 'next/navigation';

type Props = {
  hasPaid:   boolean;   // đã thanh toán gói Holland?
  hasResult: boolean;   // đã hoàn thành & có kết quả?
};

const PRICE = 20_000;
const STAT  = [
  { value: '54',  label: 'Câu hỏi'      },
  { value: '2',   label: 'Lựa chọn/câu' },
  { value: '20K', label: 'Phí'          },
];

const StatBox = ({ value, label }: { value: string; label: string }) => (
  <div className="border rounded-2xl py-6">
    <p className="text-4xl font-bold">{value}</p>
    <p className="text-gray-500">{label}</p>
  </div>
);

export default function HollandIntro({ hasPaid, hasResult }: Props) {
  const router = useRouter();

  /* --------------------------------- nút hành động */
  const onClick = () => {
    if (hasResult)          router.push('/profile?step=trait');      // xem lại
    else if (hasPaid)       router.push('/holland/quiz?start=1');    // bắt đầu làm
    else                    router.push('/payment?product=holland'); // thanh toán
  };

  const label =
    hasResult ? 'Xem lại kết quả'
    : hasPaid ? 'Bắt đầu Quiz Holland'
    : `Thanh toán ${PRICE.toLocaleString()} đ`;

  /* --------------------------------- render */
  return (
    <section className="max-w-3xl mx-auto px-4 py-12 text-center space-y-10">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold">Bộ câu hỏi Holland</h1>
        <p className="text-gray-600">
          Khám phá nhóm nghề nghiệp phù hợp nhất với bạn thông qua trắc nghiệm Holland RIASEC.
        </p>
      </header>

      {/* Thống kê */}
      <div className="grid grid-cols-3 gap-4">
        {STAT.map(s => <StatBox key={s.label} {...s} />)}
      </div>

      {/* Quy trình */}
      <div className="border border-dashed rounded-2xl p-6 text-left leading-6 inline-block">
        <p className="font-semibold mb-2">Quy trình:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li><b>Thanh toán</b> {PRICE.toLocaleString()} đ (QR ở trang thanh toán)</li>
          <li><b>Hoàn thành</b> 54 câu hỏi – chọn đáp án đúng nhất với bạn</li>
          <li><b>Kết quả</b> sẽ hiển thị trong Hồ sơ nghề nghiệp</li>
        </ol>
      </div>

      <button
        onClick={onClick}
        className="w-full max-w-md border rounded-xl py-4 font-semibold
                   hover:bg-blue-600 hover:text-white transition"
      >
        {label}
      </button>
    </section>
  );
}
