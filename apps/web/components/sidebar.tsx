"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@biogrow/ui/lib/utils";
import {
  LayoutDashboard, Users, ShoppingCart,
  Package, DollarSign, Settings, Building, ChevronDown,
  ChevronRight, BarChart3, Globe, Calculator,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  children?: { name: string; href: string }[];
}

function buildNav(slug: string): NavItem[] {
  const b = `/${slug}`;
  return [
    { name: "Dashboard", href: `${b}/dashboard`, icon: LayoutDashboard },
    {
      name: "CRM",
      href: `${b}/crm`,
      icon: Users,
      children: [
        { name: "Dashboard", href: `${b}/crm/dashboard` },
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
        { name: "Stock", href: `${b}/inventory/stock` },
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
}

export function Sidebar({ companySlug }: { companySlug: string }) {
  const pathname = usePathname();
  const slug = companySlug || "prime-blocks";
  const nav = buildNav(slug);

  // Start with all sections expanded
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    CRM: true,
    Sales: true,
    Inventory: true,
    Finance: true,
  });

  const toggleExpand = (name: string) => {
    setExpanded((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-gray-200">
        <Link href={`/${slug}/dashboard`} className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center">
            <Building className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-gray-900">Biogrow</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <ul className="space-y-1">
          {nav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const isExpanded = expanded[item.name] ?? false;

            if (item.children) {
              return (
                <li key={item.name}>
                  <button
                    onClick={() => toggleExpand(item.name)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{item.name}</span>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {isExpanded && (
                    <ul className="ml-7 mt-1 border-l-2 border-gray-100 pl-3 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={cn(
                              "block px-3 py-1.5 rounded text-sm",
                              pathname === child.href
                                ? "text-emerald-700 font-medium bg-emerald-50"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                            )}
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200">
        <Link
          href="/holding"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100"
        >
          <Globe className="h-4 w-4" />
          Holding View
        </Link>
      </div>
    </aside>
  );
}