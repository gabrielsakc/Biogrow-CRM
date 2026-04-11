"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { COMPANY_CONFIGS } from "@/company-configs";

// Set to false to bypass authentication for internal use
const REQUIRE_AUTH = false;

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export default function SelectCompanyPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("Usuario");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Skip auth check if REQUIRE_AUTH is false
    if (REQUIRE_AUTH) {
      const session = getCookie("biogrow_session");
      if (!session || session !== "authenticated") {
        router.replace("/sign-in");
        return;
      }
    }

    const user = getCookie("biogrow_user");
    if (user) setUserName(user);
  }, [router]);

  function handleSignOut() {
    deleteCookie("biogrow_session");
    deleteCookie("biogrow_user");
    router.push("/sign-in");
  }

  const companies = Object.values(COMPANY_CONFIGS);

  // Don't render until client-side hydration is complete
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl mb-4">
            <span className="text-white text-2xl font-bold">B</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Biogrow Platform</h1>
          <p className="text-gray-600 mt-2">
            Bienvenido, {userName}. Selecciona una empresa para continuar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {companies.map((company) => (
            <Link
              key={company.slug}
              href={`/${company.slug}/dashboard`}
              className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-emerald-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{
                    backgroundColor:
                      company.branding?.primaryColor ?? "#059669",
                  }}
                >
                  {company.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate group-hover:text-emerald-700">
                    {company.name}
                  </p>
                  {company.description && (
                    <p className="text-xs text-gray-500 truncate">
                      {company.description}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 hover:text-red-600 underline underline-offset-2 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
