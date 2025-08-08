"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface Props {
  className?: string;
  children?: React.ReactNode;
}

/**
 * A login link that always carries `redirectTo=<current URL>`.
 * Use it everywhere instead of hard-coding href="/signup".
 */
export default function LoginLink({ className, children }: Props) {
  const pathname = usePathname();
  const search = useSearchParams();
  const current = pathname + (search?.toString() ? `?${search!.toString()}` : "");
  const href = `/signup?redirectTo=${encodeURIComponent(current)}`;
  return (
    <Link href={href} className={className}>
      {children ?? "Đăng ký / Đăng nhập"}
    </Link>
  );
}