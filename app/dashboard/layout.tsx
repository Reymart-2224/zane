"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import zaneIcon from "@/assets/media/zane-icon.png";
type LoggedInUser = {
  id: string;
  username: string;
  role: string;
  first_name?: string;
  last_name?: string;
};

type MenuItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const logout = () => {
    localStorage.removeItem("loggedInUser");
    router.replace("/login");
  };

  const menuItems: MenuItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <DashboardIcon />,
    },
    {
      label: "Clients",
      href: "/dashboard/clients",
      icon: <UsersIcon />,
    },
  ];

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#dff4ff] text-[#1f7f68]">
        <p className="font-medium">Checking session...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#bfeeff] via-[#ddf7ff] to-[#f4fbff] p-3 sm:p-4 md:p-6 text-[#1d2b35]">
      <div className="relative min-h-[calc(100vh-24px)] sm:min-h-[calc(100vh-32px)] md:min-h-[calc(100vh-48px)] rounded-[22px] sm:rounded-[28px] md:rounded-[32px] bg-white/45 backdrop-blur-xl border border-white/80 shadow-[0_24px_70px_rgba(33,116,132,0.18)] overflow-hidden flex">
        {/* Desktop Sidebar */}
        <aside className="w-[250px] bg-[#296589] text-white p-6 hidden lg:flex flex-col">
          <SidebarContent
            menuItems={menuItems}
            pathname={pathname}
            logout={logout}
          />
        </aside>

        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          />
        )}

        {/* Mobile Sidebar */}
        <aside
          className={`fixed left-3 top-3 bottom-3 z-50 w-[280px] max-w-[calc(100vw-24px)] rounded-[24px] bg-[#296589] text-white p-5 shadow-2xl transition-transform duration-300 lg:hidden ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-[115%]"
          }`}
        >
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
               <Image
              src={zaneIcon}
              alt="Zane Icon"
              className="mx-auto mb-8 h-20 w-20 object-contain"
            />
              <div>
                <p className="text-xs text-white/70 mt-1">Admin Panel</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center hover:bg-white/20 transition"
            >
              <CloseIcon />
            </button>
          </div>

          <SidebarContent
            menuItems={menuItems}
            pathname={pathname}
            logout={logout}
          />
        </aside>

        {/* Content */}
        <section className="flex-1 min-w-0 p-3 sm:p-4 md:p-6">
          {/* Topbar */}
          <header className="mb-5 flex flex-col gap-3 lg:h-[74px] lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between gap-3 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
                className="h-12 w-12 rounded-2xl bg-white border border-[#ecf6f4] flex items-center justify-center shadow-sm text-[#296589]"
              >
                <MenuIcon />
              </button>

              <div className="flex items-center gap-3">
                <div className="hidden xs:flex items-center gap-2 rounded-full bg-[#296589] text-white px-4 py-3 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-white block" />
                  Online
                </div>

                <div className="w-12 h-12 rounded-full bg-white border border-[#ecf6f4] flex items-center justify-center shadow-sm font-bold text-[#296589]">
                  {(
                    user?.first_name?.[0] ||
                    user?.username?.[0] ||
                    "A"
                  ).toUpperCase()}
                </div>
              </div>
            </div>

            <div className="w-full max-w-full lg:max-w-[430px]" >
              <div className="bg-white rounded-2xl h-12 px-4 sm:px-5 flex items-center gap-3 shadow-sm border border-[#ecf6f4]" hidden>
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full min-w-0 outline-none text-sm text-[#1d2b35] placeholder:text-gray-400 bg-transparent"
                />
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-[#296589] text-white px-4 py-3 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-white block" />
                Online
              </div>

              <div className="w-12 h-12 rounded-full bg-white border border-[#ecf6f4] flex items-center justify-center shadow-sm font-bold text-[#296589]">
                {(
                  user?.first_name?.[0] ||
                  user?.username?.[0] ||
                  "A"
                ).toUpperCase()}
              </div>
            </div>
          </header>

        <div className="min-w-0">{children}</div>

<footer className="mt-6 rounded-2xl border border-[#ecf6f4] bg-white/70 px-4 py-4 text-center text-xs text-gray-500 shadow-sm sm:flex sm:items-center sm:justify-between sm:text-left">
  <p>
    © {new Date().getFullYear()} Zane IT Solutions. All rights reserved.
  </p>

  <p className="mt-1 sm:mt-0">
    Developer:{" "}
    <span className="font-semibold text-[#296589]">
      Reymart Dungca
    </span>
  </p>
</footer>
        </section>
      </div>
    </main>
  );
}

function SidebarContent({
  menuItems,
  pathname,
  logout,
}: {
  menuItems: MenuItem[];
  pathname: string;
  logout: () => void;
}) {
  return (
    <>
      <div className="hidden lg:flex items-center gap-3 mb-12">
        <div className="w-9 h-9 rounded-xl  flex items-center justify-center font-bold">
            <Image
              src={zaneIcon}
              alt="Zane Icon"
              className="mx-auto  h-20 w-20 object-contain"
            />
        </div>
        <div>
         
          <p className="text-xs text-white mt-1 font-bold">Admin Panel</p>
        </div>
      </div>

      <nav className="space-y-3 flex-1">
        {menuItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

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
              <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button
        onClick={logout}
        className="mt-6 flex w-full items-center justify-center gap-2 bg-white text-[#296589] rounded-full px-5 py-3 text-sm font-semibold hover:bg-[#effffb] transition shadow-md"
      >
        <LogoutIcon />
        Logout
      </button>
    </>
  );
}

function DashboardIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-gray-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}