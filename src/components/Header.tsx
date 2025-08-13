// src/components/Header.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const MENU = [
  { label: "Profile", href: "/profile" },
  { label: "MBTI", href: "/mbti" },
  { label: "Holland", href: "/holland" },
  { label: "Giá trị bản thân", href: "/knowdell" },
  { label: "Tin tức", href: "/blog" },
  { label: "Chatbot/FAQ", href: "/chat" },
];

export default function Header() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      router.refresh();
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 sm:h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Image
            src="/logo.png"
            alt="Logo"
            width={32}
            height={32}
            className="sm:w-10 sm:h-10"
          />
          <span className="text-base sm:text-lg font-semibold text-navText">
            Hướng nghiệp AI
          </span>
        </Link>

        {/* Desktop menu */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-4 sm:gap-8 lg:gap-12 whitespace-nowrap">
          {MENU.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="text-sm sm:text-base text-navText hover:text-blue-600 transition"
            >
              {m.label}
            </Link>
          ))}
        </nav>

        {/* Auth buttons + hamburger */}
        <div className="flex items-center gap-2 sm:gap-4">
          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Image
                src={user.user_metadata?.avatar_url ?? "/default-avatar.png"}
                alt="avatar"
                width={28}
                height={28}
                className="rounded-full"
              />
              <span className="text-sm text-navText truncate max-w-[100px]">
                {user.user_metadata?.full_name ?? user.email}
              </span>
              <button
                onClick={signOut}
                className="px-3 py-1 text-sm rounded bg-red-500 hover:bg-red-600 text-white transition"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link
              href="/signup"
              className="hidden sm:inline-block px-4 py-1.5 text-sm sm:text-base rounded-full bg-brandYellow hover:bg-yellow-500 text-black transition"
            >
              Đăng ký / Đăng nhập
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="p-2 md:hidden text-gray-600 hover:text-gray-800 transition"
            aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
          >
            {menuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile overlay menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40">
          <div className="absolute top-0 right-0 w-3/4 max-w-xs h-full bg-white shadow-lg p-6 space-y-6 overflow-y-auto">
            <nav className="flex flex-col gap-4">
              {MENU.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-base text-gray-800 hover:text-blue-600 transition"
                >
                  {m.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-gray-200 pt-4">
              {user ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Image
                      src={user.user_metadata?.avatar_url ?? "/default-avatar.png"}
                      alt="avatar"
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                    <span className="text-sm text-navText truncate">
                      {user.user_metadata?.full_name ?? user.email}
                    </span>
                  </div>
                  <button
                    onClick={signOut}
                    className="w-full px-4 py-2 text-sm rounded bg-red-500 hover:bg-red-600 text-white transition"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <Link
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-center px-4 py-2 rounded-full bg-brandYellow hover:bg-yellow-500 text-black transition"
                >
                  Đăng ký / Đăng nhập
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
