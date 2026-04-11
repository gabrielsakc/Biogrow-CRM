"use client";

import { Bell, Search, LogOut, ChevronDown } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();

  function handleSignOut() {
    document.cookie = "biogrow_session=; path=/; max-age=0";
    document.cookie = "biogrow_user=; path=/; max-age=0";
    router.push("/sign-in");
  }

  // Derive breadcrumb from pathname
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumb = segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "),
    href: "/" + segments.slice(0, i + 1).join("/"),
  }));

  return (
    <header className="h-14 bg-white/80 backdrop-blur-sm border-b border-gray-200/80 flex items-center justify-between px-6 shrink-0 z-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm">
        {breadcrumb.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-gray-300">/</span>}
            <span
              className={
                i === breadcrumb.length - 1
                  ? "font-medium text-gray-900"
                  : "text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
              }
            >
              {crumb.label}
            </span>
          </span>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="search"
            placeholder="Search..."
            className="pl-9 pr-4 py-1.5 w-56 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 focus:bg-white transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex h-5 items-center gap-1 rounded border border-gray-200 bg-gray-100 px-1.5 font-mono text-[10px] text-gray-400">
            ⌘K
          </kbd>
        </div>

        {/* Notification */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors group">
          <Bell className="h-4 w-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200 mx-1" />

        {/* User menu */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors group"
          title="Sign out"
        >
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
            <span className="text-[11px] font-bold text-white">BG</span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </button>
      </div>
    </header>
  );
}
