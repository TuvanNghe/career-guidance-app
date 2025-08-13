// app/blog/[slug]/page.tsx
import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import styles from './post.module.css';
import HuongNghiepCap3 from '../notebooks/HuongNghiepCap3';
import CachXacDinhNghe from '../notebooks/CachXacDinhNghe';

// 👇 Quan trọng: trong Next 15, params là Promise
type PageProps = { params: Promise<{ slug: string }> };

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params; // 👈 phải await

  const META: Record<string, { title: string; category: 'MBTI'|'Holland'|'Tips'; date: string }> = {
    'huong-nghiep-cap-3': { title: 'Hướng nghiệp từ cấp 3 – Bí quyết chọn nghề phù hợp với bản thân', category: 'Tips', date: '2025-01-12' },
    'cach-xac-dinh-nghe': { title: 'Cách xác định nghề nghiệp tương lai phù hợp với học sinh cấp 3', category: 'Holland', date: '2025-01-20' },
  };

  let Content: React.FC | null = null;
  switch (slug) {
    case 'huong-nghiep-cap-3': Content = HuongNghiepCap3; break;
    case 'cach-xac-dinh-nghe': Content = CachXacDinhNghe; break;
    default: return notFound();
  }

  const meta = META[slug];

  return (
    <main className={styles.wrap}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/" className={styles.crumb}>Trang chủ</Link>
        <span className={styles.sep}>/</span>
        <Link href="/blog" className={styles.crumb}>Blog</Link>
        <span className={styles.sep}>/</span>
        <span className={`${styles.crumb} ${styles.current}`}>{meta.title}</span>
      </nav>

      <header className={styles.header}>
        <div className={styles.pill}>{meta.category}</div>
        <h1 className={styles.title}>{meta.title}</h1>
        <div className={styles.meta}>
          <time>{formatDate(meta.date)}</time>
          <span className={styles.dot}>•</span>
          <span>{estimateReadingTime(slug)} phút đọc</span>
        </div>
      </header>

      <section className={styles.layout}>
        <article className={styles.content}>
          {/* Nội dung bài */}
          {Content && <Content />}
        </article>

        <aside className={styles.aside}>
          <div className={styles.asideCard}>
            <h3>Bài viết mới</h3>
            <ul className={styles.list}>
              {Object.entries(META).filter(([s]) => s !== slug).map(([s, m]) => (
                <li key={s}>
                  <Link href={`/blog/${s}`}>{m.title}</Link>
                  <div className={styles.asideMeta}>
                    <span className={styles.tag}>{m.category}</span> · <time>{formatDate(m.date)}</time>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.asideCard}>
            <h3>Công cụ hữu ích</h3>
            <ul className={`${styles.list} ${styles.tools}`}>
              <li><Link href="/mbti">Trắc nghiệm MBTI</Link></li>
              <li><Link href="/holland">Bộ Holland (RIASEC)</Link></li>
              <li><Link href="/knowdell">Giá trị bản thân</Link></li>
              <li><Link href="/chat">Hỏi Chatbot tư vấn</Link></li>
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}

function formatDate(d: string) {
  const date = new Date(d);
  return isNaN(date.getTime())
    ? d
    : date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function estimateReadingTime(slug: string) {
  return ({ 'huong-nghiep-cap-3': 6, 'cach-xac-dinh-nghe': 5 } as Record<string, number>)[slug] ?? 5;
}
