"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type LoggedInUser = {
  id: string;
  username: string;
  role: string;
  first_name?: string;
  last_name?: string;
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");

    if (!storedUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      if (!parsedUser || !parsedUser.role) {
        localStorage.removeItem("loggedInUser");
        router.replace("/login");
        return;
      }

      setUser(parsedUser);
      setChecking(false);
    } catch {
      localStorage.removeItem("loggedInUser");
      router.replace("/login");
    }
  }, [router]);

  const logout = () => {
    localStorage.removeItem("loggedInUser");
    router.replace("/login");
  };

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#dff4ff] text-[#1f7f68]">
        <p className="font-medium">Checking session...</p>
      </main>
    );
  }

  const menuItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: "⌂",
    },
    {
      label: "Clients",
      href: "/dashboard/clients",
      icon: "◉",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#bfeeff] via-[#ddf7ff] to-[#f4fbff] p-4 md:p-6 text-[#1d2b35]">
      <div className="min-h-[calc(100vh-48px)] rounded-[32px] bg-white/45 backdrop-blur-xl border border-white/80 shadow-[0_24px_70px_rgba(33,116,132,0.18)] overflow-hidden flex">
        {/* Sidebar */}
        <aside className="w-[250px] bg-[#296589] text-white p-6 hidden md:flex flex-col">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold">
              Z
            </div>
            <div>
              <h1 className="font-bold leading-none">Zane</h1>
              <p className="text-xs text-white/70 mt-1">Admin Panel</p>
            </div>
          </div>

          <nav className="space-y-3 flex-1">
            {menuItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-white text-[#296589] shadow-lg"
                      : "text-white/90 hover:bg-white/15"
                  }`}
                >
                  <span className="w-5">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={logout}
            className="mt-auto bg-white text-[#296589] rounded-full px-5 py-3 text-sm font-semibold hover:bg-[#effffb] transition shadow-md"
          >
            Logout
          </button>
        </aside>

        {/* Content */}
        <section className="flex-1 p-4 md:p-6">
          {/* Topbar */}
          <header className="h-[74px] flex items-center justify-between gap-4 mb-5">
            <div className="flex-1 max-w-[430px]">
              <div className="bg-white rounded-2xl h-12 px-5 flex items-center shadow-sm border border-[#ecf6f4]">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full outline-none text-sm text-[#1d2b35] placeholder:text-gray-400"
                />
                <span className="text-gray-400">⌕</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 rounded-full bg-[#296589] text-white px-4 py-3 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-white block" />
                Online
              </div>

              <div className="w-12 h-12 rounded-full bg-white border border-[#ecf6f4] flex items-center justify-center shadow-sm font-bold text-[#296589]">
                {(user?.first_name?.[0] || user?.username?.[0] || "A").toUpperCase()}
              </div>
            </div>
          </header>

          {children}
        </section>
      </div>
    </main>
  );
}