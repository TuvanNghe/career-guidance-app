'use client';

import { useRouter } from 'next/navigation';

const STAT = [
  { value: '60',  label: 'Câu hỏi' },
  { value: '2',   label: 'Lựa chọn/câu' },
  { value: 'Free', label: 'Phí' }
];
const StatBox = ({ value, label }: { value: string; label: string }) => (
  <div className="border rounded-2xl py-6">
    <p className="text-4xl font-bold">{value}</p>
    <p className="text-gray-500">{label}</p>
  </div>
);

export default function MbtiIntro({ hasResult }: { hasResult:boolean }) {
  const router = useRouter();
  const handle  = () =>
    hasResult ? router.push('/profile?step=trait') : router.push('/mbti/quiz?start=1');

  return (
    <section className="max-w-3xl mx-auto px-4 py-12 text-center space-y-10">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold">Bộ câu hỏi MBTI</h1>
        <p className="text-gray-600">
          Đây là bộ câu hỏi đánh giá tính cách (MBTI) giúp bạn hiểu rõ điểm mạnh, điểm yếu.
        </p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {STAT.map(s => <StatBox key={s.label} {...s} />)}
      </div>

      {/* Quy trình */}
      <div className="border border-dashed rounded-2xl p-6 text-left leading-6 inline-block">
        <p className="font-semibold mb-2">Quy trình:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li><b>Thanh toán</b> 0 đ (miễn phí)</li>
          <li><b>Hoàn thành</b> 60 câu hỏi – chọn đáp án đúng nhất với bạn</li>
          <li><b>Kết quả</b> sẽ được hiển thị trong Hồ sơ nghề nghiệp</li>
        </ol>
      </div>

      <button
        onClick={handle}
        className="w-full max-w-md border rounded-xl py-4 font-semibold
                   hover:bg-blue-600 hover:text-white transition"
      >
        {hasResult ? 'Xem lại kết quả' : 'Bắt đầu Quiz MBTI'}
      </button>
    </section>
  );
}
