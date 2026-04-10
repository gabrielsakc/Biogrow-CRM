"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@biogrow/ui/lib/utils";
import {
  LayoutDashboard, Users, Building2, ShoppingCart,
  Package, DollarSign, Settings, Building, ChevronDown,
  ChevronRight, BarChart3, Globe, Truck, Calculator,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  children?: { name: string; href: string }[];
}

function buildNav(slug: string): NavItem[] {
  const b = `/${slug}`;
  const baseNav: NavItem[] = [
    { name: "Dashboard", href: `${b}/dashboard`, icon: LayoutDashboard },
    {
      name: "CRM",
      href: `${b}/crm`,
      icon: Users,
      children: [
        { name: "CRM Dashboard", href: `${b}/crm/dashboard` },
        { name: "Leads", href: `${b}/crm/leads` },
        { name: "Accounts", href: `${b}/crm/accounts` },
        { name: "Contacts", href: `${b}/crm/contacts` },
        { name: "Pipeline", href: `${b}/crm/pipeline` },
        { name: "Opportunities", href: `${b}/crm/opportunities` },
        { name: "Activities", href: `${b}/crm/activities` },
        { name: "Tasks", href: `${b}/crm/tasks` },
        { name: "Quotes", href: `${b}/crm/quotes` },
        { name: "Forecast", href: `${b}/crm/forecast` },
      ],
    },
    {
      name: "Sales",
      href: `${b}/sales`,
      icon: ShoppingCart,
      children: [
        { name: "Sales Orders", href: `${b}/sales` },
        { name: "Purchase Orders", href: `${b}/sales/purchasing` },
      ],
    },
    {
      name: "Inventory",
      href: `${b}/inventory`,
      icon: Package,
      children: [
        { name: "Products", href: `${b}/inventory/products` },
        { name: "Vendors", href: `${b}/inventory/vendors` },
        { name: "Warehouses", href: `${b}/inventory/warehouses` },
        { name: "Current Stock", href: `${b}/inventory/stock` },
        { name: "Movements", href: `${b}/inventory/movements` },
      ],
    },
    {
      name: "Finance",
      href: `${b}/finance`,
      icon: DollarSign,
      children: [
        { name: "Overview", href: `${b}/finance` },
        { name: "Invoices", href: `${b}/finance/invoices` },
        { name: "Receivables", href: `${b}/finance/receivables` },
      ],
    },
    { name: "Reports", href: `${b}/reports`, icon: BarChart3 },
    { name: "Settings", href: `${b}/settings`, icon: Settings },
  ];

  // Add EPS Calculator for Prime Tech Blocks
  if (slug === "prime-blocks") {
    baseNav.splice(5, 0, {
      name: "EPS Calculator",
      href: `${b}/eps-calculator`,
      icon: Calculator
    });
  }

  return baseNav;
}

export function Sidebar({ companySlug }: { companySlug: string }) {
  const pathname = usePathname();
  const effectiveSlug = companySlug || pathname.split("/").filter(Boolean)[0] || "";
  const nav = buildNav(effectiveSlug);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    CRM: pathname.includes("/crm"),
    Sales: pathname.includes("/sales"),
    Inventory: pathname.includes("/inventory"),
    Finance: pathname.includes("/finance"),
  });

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-gray-200">
        <Link href={`/${effectiveSlug}/dashboard`} className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center">
            <Building className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-gray-900">Biogrow</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {nav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== `/${effectiveSlug}/dashboard` && pathname.startsWith(item.href));
          const isOpen = expanded[item.name] ?? false;

          if (item.children) {
            return (
              <div key={item.name}>
                <button
                  type="button"
                  onClick={() => setExpanded((p) => ({ ...p, [item.name]: !p[item.name] }))}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{item.name}</span>
                  {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                </button>
                {isOpen && (
                  <div className="ml-7 mt-0.5 border-l border-gray-100 pl-3 space-y-0.5">
                    {item.children.map((child) => {
                      const childActive = pathname === child.href || pathname.startsWith(child.href + "/");
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "block px-3 py-1.5 rounded-md text-sm transition-colors",
                            childActive
                              ? "text-emerald-700 font-medium bg-emerald-50"
                              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                          )}
                        >
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 space-y-0.5">
        <Link
          href="/holding"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <Globe className="h-4 w-4" />
          Holding View
        </Link>
        <Link
          href="/select-company"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <Building2 className="h-4 w-4" />
          Switch Company
        </Link>
      </div>
    </aside>
  );
}
