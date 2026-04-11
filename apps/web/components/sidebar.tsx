"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@biogrow/ui/lib/utils";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  Settings,
  BarChart3,
  Globe,
  Target,
  Activity,
  FileText,
  TrendingUp,
  Layers,
  ChevronRight,
  Calculator,
} from "lucide-react";

interface SidebarProps {
  companySlug: string;
}

const NAV_SECTIONS = (base: string) => [
  {
    label: null,
    items: [
      { name: "Dashboard", href: `${base}/dashboard`, icon: LayoutDashboard },
    ],
  },
  {
    label: "CRM",
    icon: Users,
    items: [
      { name: "Overview", href: `${base}/crm/dashboard`, icon: BarChart3 },
      { name: "Leads", href: `${base}/crm/leads`, icon: Users },
      { name: "Accounts", href: `${base}/crm/accounts`, icon: Layers },
      { name: "Contacts", href: `${base}/crm/contacts`, icon: FileText },
      { name: "Pipeline", href: `${base}/crm/pipeline`, icon: Target },
      { name: "Opportunities", href: `${base}/crm/opportunities`, icon: TrendingUp },
      { name: "Activities", href: `${base}/crm/activities`, icon: Activity },
      { name: "Tasks", href: `${base}/crm/tasks`, icon: FileText },
      { name: "Quotes", href: `${base}/crm/quotes`, icon: FileText },
      { name: "Forecast", href: `${base}/crm/forecast`, icon: BarChart3 },
    ],
  },
  {
    label: "Sales",
    icon: ShoppingCart,
    items: [
      { name: "Sales Orders", href: `${base}/sales`, icon: ShoppingCart },
      { name: "Purchasing", href: `${base}/sales/purchasing`, icon: Package },
    ],
  },
  {
    label: "Inventory",
    icon: Package,
    items: [
      { name: "Products", href: `${base}/inventory/products`, icon: Package },
      { name: "Vendors", href: `${base}/inventory/vendors`, icon: Users },
      { name: "Warehouses", href: `${base}/inventory/warehouses`, icon: Layers },
      { name: "Stock", href: `${base}/inventory/stock`, icon: BarChart3 },
    ],
  },
  {
    label: "Finance",
    icon: DollarSign,
    items: [
      { name: "Overview", href: `${base}/finance`, icon: DollarSign },
      { name: "Invoices", href: `${base}/finance/invoices`, icon: FileText },
      { name: "Receivables", href: `${base}/finance/receivables`, icon: TrendingUp },
    ],
  },
];

export function Sidebar({ companySlug }: SidebarProps) {
  const pathname = usePathname();
  const slug = companySlug || "prime-blocks";
  const base = `/${slug}`;

  const isActive = (href: string) =>
    pathname === href || (href !== `${base}/dashboard` && pathname.startsWith(href + "/"));

  const sections = NAV_SECTIONS(base);

  const companyInitials = slug
    .split("-")
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");

  const companyName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <aside className="w-64 flex flex-col shrink-0 h-screen bg-[#0b0f19] border-r border-white/[0.06]">
      {/* Logo / Company */}
      <div className="h-16 flex items-center px-4 border-b border-white/[0.06] shrink-0">
        <Link href={`${base}/dashboard`} className="flex items-center gap-3 w-full">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/40 shrink-0">
            <span className="text-xs font-bold text-white">{companyInitials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{companyName}</p>
            <p className="text-[10px] text-slate-500 truncate">Biogrow Group</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll px-3 py-4 space-y-5">
        {sections.map((section, si) => (
          <div key={si}>
            {section.label && (
              <div className="flex items-center gap-2 px-2 mb-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                  {section.label}
                </span>
                <div className="flex-1 h-px bg-white/[0.04]" />
              </div>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-150",
                        active
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.05]"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          active ? "text-emerald-400" : "text-slate-600 group-hover:text-slate-400"
                        )}
                      />
                      <span className="font-medium">{item.name}</span>
                      {active && (
                        <ChevronRight className="h-3 w-3 ml-auto text-emerald-400/60" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Manufacturing Tools — Prime Tech Blocks only */}
      {slug === "prime-blocks" && (
        <div className="shrink-0 border-t border-white/[0.06] px-3 pt-3 pb-1">
          <div className="flex items-center gap-2 px-2 mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              Tools
            </span>
            <div className="flex-1 h-px bg-white/[0.04]" />
          </div>
          <ul className="space-y-0.5">
            <li>
              <Link
                href={`${base}/eps-calculator`}
                className={cn(
                  "group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-150",
                  pathname.startsWith(`${base}/eps-calculator`)
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.05]"
                )}
              >
                <Calculator
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    pathname.startsWith(`${base}/eps-calculator`)
                      ? "text-emerald-400"
                      : "text-slate-600 group-hover:text-slate-400"
                  )}
                />
                <span className="font-medium">EPS Calculator</span>
                {pathname.startsWith(`${base}/eps-calculator`) && (
                  <ChevronRight className="h-3 w-3 ml-auto text-emerald-400/60" />
                )}
              </Link>
            </li>
          </ul>
        </div>
      )}

      {/* Bottom Links */}
      <div className="shrink-0 border-t border-white/[0.06] px-3 py-3 space-y-0.5">
        <Link
          href={`${base}/reports`}
          className={cn(
            "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-150",
            pathname.includes("/reports")
              ? "bg-emerald-500/10 text-emerald-400"
              : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.05]"
          )}
        >
          <BarChart3 className="h-4 w-4 text-slate-600" />
          <span className="font-medium">Reports</span>
        </Link>
        <Link
          href={`${base}/settings`}
          className={cn(
            "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-150",
            pathname.includes("/settings")
              ? "bg-emerald-500/10 text-emerald-400"
              : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.05]"
          )}
        >
          <Settings className="h-4 w-4 text-slate-600" />
          <span className="font-medium">Settings</span>
        </Link>

        {/* Holding divider */}
        <div className="pt-2 mt-1 border-t border-white/[0.05]">
          <Link
            href="/holding"
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition-all duration-150"
          >
            <Globe className="h-4 w-4" />
            <span className="font-medium">Holding View</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
