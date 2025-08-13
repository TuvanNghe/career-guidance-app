'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: 'MBTI' | 'Holland' | 'Tips';
  date: string; // ISO hoặc chuỗi ngày
  image?: string; // để sau dùng Next/Image nếu có ảnh thật
};

const posts: Post[] = [
  {
    slug: 'huong-nghiep-cap-3',
    title: 'Hướng nghiệp từ cấp 3 – Bí quyết chọn nghề phù hợp với bản thân',
    excerpt:
      'Từ việc hiểu rõ bản thân đến lập kế hoạch học tập, đây là lộ trình giúp học sinh cấp 3 chọn nghề tự tin và đúng hướng.',
    category: 'Tips',
    date: '2025-01-12',
  },
  {
    slug: 'cach-xac-dinh-nghe',
    title: 'Cách xác định nghề nghiệp tương lai phù hợp với học sinh cấp 3',
    excerpt:
      '5 bước thực tế: khám phá sở thích – năng lực, hỏi chuyên gia, trải nghiệm ngoại khóa và lên kế hoạch học tập.',
    category: 'Holland',
    date: '2025-01-20',
  },
  // Có thể thêm bài viết khác ở đây…
];

const categories: Array<Post['category'] | 'Tất cả'> = [
  'Tất cả',
  'MBTI',
  'Holland',
  'Tips',
];

export default function BlogIndex() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<(typeof categories)[number]>('Tất cả');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    return posts.filter((p) => {
      const matchCat = cat === 'Tất cả' ? true : p.category === cat;
      const matchText =
        !keyword ||
        p.title.toLowerCase().includes(keyword) ||
        p.excerpt.toLowerCase().includes(keyword);
      return matchCat && matchText;
    });
  }, [q, cat]);

  const totalPages = Math.max(1, Math.ceil(Math.max(0, filtered.length - 1) / pageSize));
  const featured = filtered[0];
  const others = filtered.slice(1);
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return others.slice(start, start + pageSize);
  }, [others, page]);

  useEffect(() => {
    setPage(1); // reset trang khi đổi filter/search
  }, [q, cat]);

  // để sticky tabs không “giật” khi cuộn
  const tabsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    const handler = () => {
      el.classList.toggle('shadow', window.scrollY > 40);
    };
    handler();
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <main className="wrap">
      {/* HERO */}
      <section className="hero">
        <div className="hero__content">
          <span className="badge">Hướng nghiệp AI</span>
          <h1 className="hero__title">Blog tư vấn hướng nghiệp</h1>
          <p className="hero__desc">
            Bài viết ngắn gọn – thực chiến về MBTI, Holland, kỹ năng định hướng
            và lộ trình vào nghề. Dễ đọc, dễ áp dụng.
          </p>

          {/* Tìm kiếm */}
          <div className="searchWrap">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
              <path
                fill="currentColor"
                d="M10 4a6 6 0 014.472 9.984l4.272 4.272-1.414 1.414-4.272-4.272A6 6 0 1110 4zm0 2a4 4 0 100 8 4 4 0 000-8z"
              />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="search"
              placeholder="Tìm bài viết: ví dụ “Holland”, “MBTI”, “chọn nghề”…"
            />
            {q && (
              <button className="clear" onClick={() => setQ('')} aria-label="Xóa tìm kiếm">
                ×
              </button>
            )}
          </div>
        </div>
      </section>

      {/* TABS sticky */}
      <div ref={tabsRef} className="tabsSticky">
        <div className="tabs">
          {categories.map((c) => (
            <button
              key={c}
              className={`tab ${c === cat ? 'active' : ''}`}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* FEATURED */}
      {featured && (
        <section className="featured">
          <article className="card card--featured">
            <div className="card__media" aria-hidden />
            <div className="card__body">
              <div className="card__meta">
                <span className="pill">{featured.category}</span>
                <span className="dot">•</span>
                <time>{formatDate(featured.date)}</time>
              </div>
              <h2 className="card__title">
                <Link href={`/blog/${featured.slug}`}>{featured.title}</Link>
              </h2>
              <p className="card__excerpt">{featured.excerpt}</p>
              <Link className="card__link" href={`/blog/${featured.slug}`}>
                Đọc ngay →
              </Link>
            </div>
          </article>
        </section>
      )}

      {/* CTA tới công cụ */}
      <section className="toolsCta">
        <Link className="toolCard mbti" href="/mbti">
          <div className="toolTitle">Làm trắc nghiệm MBTI</div>
          <div className="toolDesc">Hiểu tính cách – chọn nghề hợp kiểu làm việc.</div>
          <span className="toolBtn">Bắt đầu →</span>
        </Link>
        <Link className="toolCard holland" href="/holland">
          <div className="toolTitle">Khám phá Holland (RIASEC)</div>
          <div className="toolDesc">Xác định nhóm sở thích nghề & gợi ý lộ trình.</div>
          <span className="toolBtn">Khám phá →</span>
        </Link>
      </section>

      {/* GRID danh sách */}
      <section className="grid">
        {pageItems.map((post) => (
          <article key={post.slug} className="card">
            <div className="card__media small" aria-hidden />
            <div className="card__body">
              <div className="card__meta">
                <span className="pill">{post.category}</span>
                <span className="dot">•</span>
                <time>{formatDate(post.date)}</time>
              </div>
              <h3 className="card__title">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h3>
              <p className="card__excerpt">{post.excerpt}</p>
              <Link className="card__link" href={`/blog/${post.slug}`}>
                Xem chi tiết →
              </Link>
            </div>
          </article>
        ))}
        {pageItems.length === 0 && (
          <div className="empty">Không có bài viết nào khớp bộ lọc.</div>
        )}
      </section>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="pager">
          <button
            className="pgBtn"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Trang trước
          </button>
          <span className="pgInfo">
            Trang {page}/{totalPages}
          </span>
          <button
            className="pgBtn"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Trang sau →
          </button>
        </div>
      )}

      {/* Đăng ký nhận bài mới */}
      <section className="subscribe">
        <div className="subInner">
          <div className="subText">
            <h3>Nhận bài viết mới mỗi tuần</h3>
            <p>Gợi ý định hướng, checklist chọn ngành & mẹo học tập gửi qua email.</p>
          </div>
          <form
            className="subForm"
            onSubmit={(e) => {
              e.preventDefault();
              alert('Đã ghi nhận email! (Bạn có thể nối vào Mailchimp/Sheet sau)');
            }}
          >
            <input type="email" required placeholder="Nhập email của bạn…" />
            <button type="submit">Đăng ký</button>
          </form>
        </div>
      </section>

      <style jsx>{`
        :global(body) {
          background: #f8fafc;
        }
        .wrap {
          padding: 24px 16px 80px;
          max-width: 1100px;
          margin: 0 auto;
        }
        /* HERO */
        .hero {
          border-radius: 20px;
          padding: 28px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          background: radial-gradient(
              1000px 420px at 10% -10%,
              rgba(54, 148, 255, 0.14),
              transparent
            ),
            radial-gradient(
              1000px 420px at 90% -10%,
              rgba(85, 255, 199, 0.14),
              transparent
            ),
            white;
        }
        .hero__content {
          max-width: 760px;
        }
        .badge {
          display: inline-block;
          font-size: 12px;
          padding: 6px 10px;
          border-radius: 999px;
          background: #eef7ff;
          border: 1px solid #d6e9ff;
          color: #0a66c2;
          margin-bottom: 10px;
        }
        .hero__title {
          font-size: clamp(28px, 4vw, 40px);
          line-height: 1.2;
          margin: 6px 0 8px;
          letter-spacing: -0.02em;
        }
        .hero__desc {
          color: #4b5563;
          margin: 0 0 18px;
        }
        .searchWrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .searchWrap svg {
          position: absolute;
          left: 12px;
          color: #94a3b8;
        }
        .search {
          width: 100%;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          padding: 12px 14px 12px 36px;
          font-size: 15px;
          outline: none;
        }
        .search:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.25);
        }
        .clear {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 32px;
          height: 32px;
          border-radius: 999px;
          border: none;
          background: transparent;
          color: #64748b;
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
        }

        /* TABS sticky */
        .tabsSticky {
          position: sticky;
          top: 68px; /* chỉnh nếu header cao/thấp hơn */
          z-index: 10;
          margin-top: 12px;
          margin-bottom: 12px;
        }
        .tabsSticky.shadow {
          filter: drop-shadow(0 6px 18px rgba(2, 8, 23, 0.06));
        }
        .tabs {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 6px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 999px;
        }
        .tab {
          border: 1px solid #e5e7eb;
          background: #fff;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .tab:hover {
          transform: translateY(-1px);
        }
        .tab.active {
          background: #0ea5e9;
          color: white;
          border-color: #0ea5e9;
        }

        /* FEATURED CARD */
        .featured {
          margin-top: 10px;
        }
        .grid {
          margin-top: 16px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .card {
          display: grid;
          grid-template-columns: 1fr 1.3fr;
          gap: 16px;
          border: 1px solid #eef2f7;
          border-radius: 16px;
          overflow: hidden;
          background: #fff;
          transition: box-shadow 0.2s ease, transform 0.2s ease;
        }
        .card:hover {
          box-shadow: 0 10px 30px rgba(2, 8, 23, 0.08);
          transform: translateY(-2px);
        }
        .card--featured {
          grid-template-columns: 1.2fr 1.8fr;
        }
        .card__media {
          background: linear-gradient(135deg, #e0f2fe, #dcfce7);
          min-height: 200px;
        }
        .card__media.small {
          min-height: 140px;
        }
        .card__body {
          padding: 18px 18px;
          display: grid;
          align-content: start;
          gap: 8px;
        }
        .card__meta {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6b7280;
          font-size: 13px;
        }
        .pill {
          background: #f1f5f9;
          border: 1px solid #e5e7eb;
          border-radius: 999px;
          padding: 4px 8px;
          font-size: 12px;
          color: #0f172a;
        }
        .dot {
          opacity: 0.6;
        }
        .card__title {
          margin: 2px 0 0;
          font-size: 20px;
          letter-spacing: -0.01em;
          line-height: 1.35;
        }
        .card__title :global(a) {
          text-decoration: none;
          color: #0f172a;
        }
        .card__title :global(a:hover) {
          text-decoration: underline;
        }
        .card__excerpt {
          color: #475569;
          font-size: 15px;
          margin: 2px 0 8px;
        }
        .card__link {
          width: max-content;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          transition: all 0.2s ease;
          color: #0f172a;
        }
        .card__link:hover {
          background: #0ea5e9;
          color: white;
          border-color: #0ea5e9;
        }

        /* CTA Tools */
        .toolsCta {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-top: 18px;
        }
        .toolCard {
          display: grid;
          align-content: start;
          gap: 6px;
          border-radius: 16px;
          padding: 16px;
          text-decoration: none;
          border: 1px solid #e5e7eb;
          background: white;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .toolCard:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(2, 8, 23, 0.08);
        }
        .toolTitle {
          font-weight: 700;
        }
        .toolDesc {
          color: #475569;
          font-size: 14px;
        }
        .toolBtn {
          margin-top: 4px;
          font-size: 14px;
          font-weight: 600;
        }
        .toolCard.mbti {
          background: linear-gradient(135deg, #eff6ff, #ecfeff);
        }
        .toolCard.holland {
          background: linear-gradient(135deg, #f0fdf4, #f5f3ff);
        }

        /* Pager */
        .pager {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin: 14px 0 6px;
        }
        .pgBtn {
          border: 1px solid #e5e7eb;
          padding: 8px 12px;
          background: white;
          border-radius: 10px;
          cursor: pointer;
        }
        .pgBtn[disabled] {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .pgInfo {
          color: #64748b;
          font-size: 14px;
        }

        /* Subscribe */
        .subscribe {
          margin-top: 18px;
        }
        .subInner {
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          background: linear-gradient(135deg, #ecfeff, #f0fdf4);
          padding: 18px;
          display: grid;
          gap: 12px;
        }
        .subText h3 {
          margin: 0 0 4px;
        }
        .subText p {
          margin: 0;
          color: #475569;
        }
        .subForm {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 8px;
        }
        .subForm input {
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 15px;
          outline: none;
        }
        .subForm button {
          border: 1px solid #0ea5e9;
          background: #0ea5e9;
          color: white;
          padding: 10px 14px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
        }

        .empty {
          text-align: center;
          color: #6b7280;
          padding: 40px 0;
        }

        /* Responsive */
        @media (min-width: 800px) {
          .grid {
            grid-template-columns: repeat(12, 1fr);
          }
          .card {
            grid-column: span 6;
          }
          .toolsCta {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 900px) {
          .card,
          .card--featured {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}

function formatDate(d: string) {
  try {
    const date = new Date(d);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return d;
  }
}
