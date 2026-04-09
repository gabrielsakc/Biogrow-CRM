import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { financeService } from "@biogrow/erp-core";
import { Badge } from "@biogrow/ui/components/badge";
import { formatCurrency } from "@biogrow/ui/lib/utils";

export default async function FinanceDashboardPage({ params }: { params: { company: string } }) {

  const { company, permissions } = await resolveCompany(params.company);

  const canViewAR = hasPermission(permissions, Permissions.ERP_RECEIVABLES_VIEW);
  const canViewAP = hasPermission(permissions, Permissions.ERP_PAYABLES_VIEW);
  const canViewCF = hasPermission(permissions, Permissions.ERP_TREASURY_VIEW);

  if (!canViewAR && !canViewAP && !canViewCF) {
    redirect(`/${params.company}/dashboard`);
  }

  const [arSummary, apSummary, cashFlow] = await Promise.all([
    canViewAR ? financeService.getARSummary(company.id) : null,
    canViewAP ? financeService.getAPSummary(company.id) : null,
    canViewCF ? financeService.getCashFlowSummary(company.id, 6) : null,
  ]);

  const totalAR = arSummary
    ? arSummary.current.balance + arSummary.overdue30.balance + arSummary.overdue60.balance + arSummary.overdue90plus.balance
    : 0;

  const currency = company.currency ?? "USD";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Finance</h1>
        <p className="text-sm text-gray-500 mt-0.5">Financial summary — {new Date().toLocaleDateString("en", { month: "long", year: "numeric" })}</p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {arSummary && (
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-medium text-gray-500">Accounts Receivable</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totalAR, currency)}</p>
            <Link href={`/${params.company}/finance/receivables`} className="text-xs text-emerald-600 mt-1 block hover:underline">
              View details →
            </Link>
          </div>
        )}
        {apSummary && (
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-rose-500" />
              <span className="text-xs font-medium text-gray-500">Accounts Payable</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(apSummary.pendingAmount, currency)}</p>
            <p className="text-xs text-gray-400 mt-1">{apSummary.pendingCount} pending POs</p>
          </div>
        )}
        {cashFlow && (
          <>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-medium text-gray-500">Revenue (6 months)</span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(cashFlow.reduce((s, m) => s + m.inflow, 0), currency)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-rose-400" />
                <span className="text-xs font-medium text-gray-500">Expenses (6 months)</span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(cashFlow.reduce((s, m) => s + m.outflow, 0), currency)}
              </p>
            </div>
          </>
        )}
      </div>

      {/* AR Aging */}
      {arSummary && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Accounts Receivable Aging</h2>
            <Link href={`/${params.company}/finance/receivables`}>
              <span className="text-xs text-emerald-600 hover:underline">View invoices →</span>
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Current",   data: arSummary.current, color: "bg-emerald-500" },
              { label: "1-30 days", data: arSummary.overdue30, color: "bg-amber-400" },
              { label: "31-60 days", data: arSummary.overdue60, color: "bg-orange-500" },
              { label: "+60 days",  data: arSummary.overdue90plus, color: "bg-rose-500" },
            ].map(({ label, data, color }) => (
              <div key={label} className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${color}`} />
                  <span className="text-xs text-gray-500">{label}</span>
                </div>
                <p className="text-base font-bold text-gray-900">{formatCurrency(data.balance, currency)}</p>
                <p className="text-xs text-gray-400">{data.count} invoices</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cash Flow table */}
      {cashFlow && cashFlow.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Cash Flow — last 6 months</h2>
            <Link href={`/${params.company}/finance/cashflow`}>
              <span className="text-xs text-emerald-600 hover:underline">View details →</span>
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left pb-2 text-xs font-medium text-gray-500">Month</th>
                <th className="text-right pb-2 text-xs font-medium text-gray-500">Inflow</th>
                <th className="text-right pb-2 text-xs font-medium text-gray-500">Outflow</th>
                <th className="text-right pb-2 text-xs font-medium text-gray-500">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cashFlow.map((row) => (
                <tr key={row.month}>
                  <td className="py-2 text-sm text-gray-600">{row.month}</td>
                  <td className="py-2 text-right text-sm font-medium text-emerald-600">
                    {formatCurrency(row.inflow, currency)}
                  </td>
                  <td className="py-2 text-right text-sm font-medium text-rose-500">
                    {formatCurrency(row.outflow, currency)}
                  </td>
                  <td className={`py-2 text-right text-sm font-bold ${row.net >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {formatCurrency(row.net, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4">
        <Link href={`/${params.company}/finance/invoices`} className="rounded-xl border border-gray-200 bg-white p-4 hover:border-emerald-300 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gray-50 group-hover:bg-emerald-50 flex items-center justify-center transition-colors">
              <FileText className="h-4 w-4 text-gray-500 group-hover:text-emerald-600 transition-colors" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Invoices</p>
              <p className="text-xs text-gray-400">Issue and manage sales invoices</p>
            </div>
          </div>
        </Link>
        <Link href={`/${params.company}/finance/receivables`} className="rounded-xl border border-gray-200 bg-white p-4 hover:border-emerald-300 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gray-50 group-hover:bg-emerald-50 flex items-center justify-center transition-colors">
              <TrendingUp className="h-4 w-4 text-gray-500 group-hover:text-emerald-600 transition-colors" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Accounts Receivable</p>
              <p className="text-xs text-gray-400">Aging and collections tracking</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
