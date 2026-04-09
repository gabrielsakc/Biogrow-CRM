"use client";

import Link from "next/link";
import { Building2, Check } from "lucide-react";
import { cn } from "@biogrow/ui/lib/utils";

interface Company {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  isPrimary: boolean;
}

interface CompanySwitcherProps {
  companies: Company[];
}

export function CompanySwitcher({ companies }: CompanySwitcherProps) {
  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
      <div className="divide-y divide-gray-100">
        {companies.map((company) => (
          <Link
            key={company.id}
            href={`/${company.slug}/dashboard`}
            className={cn(
              "flex items-center justify-between p-4 hover:bg-gray-50 transition-colors",
              company.isPrimary && "bg-emerald-50"
            )}
          >
            <div className="flex items-center gap-3">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-emerald-600" />
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{company.name}</p>
                {company.isPrimary && (
                  <p className="text-xs text-emerald-600">Empresa principal</p>
                )}
              </div>
            </div>
            {company.isPrimary && (
              <Check className="h-5 w-5 text-emerald-600" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}