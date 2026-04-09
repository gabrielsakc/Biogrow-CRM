import { redirect } from "next/navigation";
import Link from "next/link";
import { BarChart3, TrendingUp, ShoppingCart, Package, DollarSign, Users } from "lucide-react";
import { resolveCompany } from "@/lib/company";

const REPORT_LINKS = [
  {
    title: "CRM Pipeline",
    description: "Pipeline by stage, rep performance, and conversion rates.",
    href: "crm/dashboard",
    icon: TrendingUp,
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    title: "Sales Orders",
    description: "Revenue by period, top customers, and order fulfillment.",
    href: "sales",
    icon: ShoppingCart,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Inventory",
    description: "Stock levels, low stock alerts, and inventory valuation.",
    href: "inventory/stock",
    icon: Package,
    color: "bg-amber-50 text-amber-600",
  },
  {
    title: "Finance",
    description: "AR aging, cash flow, and outstanding invoices.",
    href: "finance",
    icon: DollarSign,
    color: "bg-rose-50 text-rose-600",
  },
  {
    title: "Forecast",
    description: "Revenue forecast by category and sales rep.",
    href: "crm/forecast",
    icon: BarChart3,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Leads & Accounts",
    description: "Lead sources, conversion funnel, and account overview.",
    href: "crm/leads",
    icon: Users,
    color: "bg-purple-50 text-purple-600",
  },
];

export default async function ReportsPage({ params }: { params: { company: string } }) {

  await resolveCompany(params.company);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-0.5">Analytics and insights across all modules</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORT_LINKS.map((report) => (
          <Link
            key={report.href}
            href={`/${params.company}/${report.href}`}
            className="rounded-xl border border-gray-200 bg-white p-5 hover:border-emerald-300 transition-colors group"
          >
            <div className="flex items-start gap-4">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${report.color}`}>
                <report.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                  {report.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{report.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
