"use client";

import { Bell, Search, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();

  function handleSignOut() {
    document.cookie = "biogrow_session=; path=/; max-age=0";
    document.cookie = "biogrow_user=; path=/; max-age=0";
    router.push("/sign-in");
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Buscar..."
            className="pl-10 pr-4 py-2 w-80 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-lg hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-600" />
        </button>
        <button
          onClick={handleSignOut}
          className="p-2 rounded-lg hover:bg-gray-100"
          title="Cerrar sesión"
        >
          <LogOut className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </header>
  );
}
