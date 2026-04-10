"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@biogrow/ui/lib/utils";
import {
  LayoutDashboard, Users, ShoppingCart,
  Package, DollarSign, Settings, Building, ChevronDown,
  BarChart3, Globe,
} from "lucide-react";

interface SidebarProps {
  companySlug: string;
}

export function Sidebar({ companySlug }: SidebarProps) {
  const pathname = usePathname();
  const slug = companySlug || "prime-blocks";
  const base = `/${slug}`;

  const sections = [
    { name: "Dashboard", href: `${base}/dashboard`, icon: LayoutDashboard },
  ];

  const crmItems = [
    { name: "Dashboard", href: `${base}/crm/dashboard` },
    { name: "Leads", href: `${base}/crm/leads` },
    { name: "Accounts", href: `${base}/crm/accounts` },
    { name: "Contacts", href: `${base}/crm/contacts` },
    { name: "Pipeline", href: `${base}/crm/pipeline` },
    { name: "Opportunities", href: `${base}/crm/opportunities` },
    { name: "Activities", href: `${base}/crm/activities` },
    { name: "Tasks", href: `${base}/crm/tasks` },
    { name: "Quotes", href: `${base}/crm/quotes` },
    { name: "Forecast", href: `${base}/crm/forecast` },
  ];

  const salesItems = [
    { name: "Sales Orders", href: `${base}/sales` },
    { name: "Purchase Orders", href: `${base}/sales/purchasing` },
  ];

  const inventoryItems = [
    { name: "Products", href: `${base}/inventory/products` },
    { name: "Vendors", href: `${base}/inventory/vendors` },
    { name: "Warehouses", href: `${base}/inventory/warehouses` },
    { name: "Stock", href: `${base}/inventory/stock` },
    { name: "Movements", href: `${base}/inventory/movements` },
  ];

  const financeItems = [
    { name: "Overview", href: `${base}/finance` },
    { name: "Invoices", href: `${base}/finance/invoices` },
    { name: "Receivables", href: `${base}/finance/receivables` },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const isCrmActive = pathname.includes("/crm");
  const isSalesActive = pathname.includes("/sales");
  const isInventoryActive = pathname.includes("/inventory");
  const isFinanceActive = pathname.includes("/finance");

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-gray-200">
        <Link href={`${base}/dashboard`} className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center">
            <Building className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-gray-900">Biogrow</span>
        </Link>
      </div>

      {/* Navigation - Always expanded */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <ul className="space-y-1">
          {/* Dashboard */}
          <li>
            <Link
              href={`${base}/dashboard`}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive(`${base}/dashboard`) && !pathname.includes("/crm") && !pathname.includes("/sales")
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </li>

          {/* CRM */}
          <li>
            <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700">
              <Users className="h-4 w-4" />
              <span>CRM</span>
              <ChevronDown className="h-4 w-4 ml-auto" />
            </div>
            <ul className="ml-7 border-l-2 border-gray-100 pl-3 space-y-1">
              {crmItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "block px-3 py-1.5 rounded text-sm",
                      isActive(item.href)
                        ? "text-emerald-700 font-medium bg-emerald-50"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>

          {/* Sales */}
          <li>
            <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700">
              <ShoppingCart className="h-4 w-4" />
              <span>Sales</span>
              <ChevronDown className="h-4 w-4 ml-auto" />
            </div>
            <ul className="ml-7 border-l-2 border-gray-100 pl-3 space-y-1">
              {salesItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "block px-3 py-1.5 rounded text-sm",
                      isActive(item.href)
                        ? "text-emerald-700 font-medium bg-emerald-50"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>

          {/* Inventory */}
          <li>
            <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700">
              <Package className="h-4 w-4" />
              <span>Inventory</span>
              <ChevronDown className="h-4 w-4 ml-auto" />
            </div>
            <ul className="ml-7 border-l-2 border-gray-100 pl-3 space-y-1">
              {inventoryItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "block px-3 py-1.5 rounded text-sm",
                      isActive(item.href)
                        ? "text-emerald-700 font-medium bg-emerald-50"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>

          {/* Finance */}
          <li>
            <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700">
              <DollarSign className="h-4 w-4" />
              <span>Finance</span>
              <ChevronDown className="h-4 w-4 ml-auto" />
            </div>
            <ul className="ml-7 border-l-2 border-gray-100 pl-3 space-y-1">
              {financeItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "block px-3 py-1.5 rounded text-sm",
                      isActive(item.href)
                        ? "text-emerald-700 font-medium bg-emerald-50"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>

          {/* Reports */}
          <li>
            <Link
              href={`${base}/reports`}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive(`${base}/reports`)
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <BarChart3 className="h-4 w-4" />
              Reports
            </Link>
          </li>

          {/* Settings */}
          <li>
            <Link
              href={`${base}/settings`}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive(`${base}/settings`)
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </li>
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