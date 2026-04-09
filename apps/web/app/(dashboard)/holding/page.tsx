import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { holdingDashboardService } from "@biogrow/holding-core";
import { Building2, TrendingUp, Users, DollarSign, Target, ShoppingCart, FileText, CheckSquare } from "lucide-react";
import { Badge } from "@biogrow/ui/components/badge";
import { Avatar } from "@biogrow/ui/components/avatar";
import { formatCurrency } from "@biogrow/ui/lib/utils";

export const metadata = {
  title: "Holding Dashboard — Biogrow Group",
};

function delta(current: number, previous: number) {
  if (previous === 0) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  return { pct, up: pct >= 0 };
}

export default async function HoldingPage() {

  const cookieStore = cookies();
  if (cookieStore.get("biogrow_session")?.value !== "authenticated") {
    redirect("/sign-in");
  }

  const [kpis, breakdown, revenueTrend, topOpps] = await Promise.all([
    holdingDashboardService.getConsolidatedKPIs(),
    holdingDashboardService.getCompanyBreakdown(),
    holdingDashboardService.getConsolidatedRevenueTrend(6),
    holdingDashboardService.getTopOpportunities(8),
  ]);

  const leadsDelta = delta(kpis.totalLeadsThisMonth, kpis.totalLeadsLastMonth);
  const wonDelta = delta(kpis.closedWonThisMonth, kpis.closedWonLastMonth);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Biogrow Group</h1>
          <p className="text-sm text-gray-500 mt-1">
            Consolidated holding view — {kpis.companies} active companies
          </p>
        </div>
        <Badge variant="primary">Holding</Badge>
      </div>

      {/* Consolidated KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">New Leads (month)</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Users className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{kpis.totalLeadsThisMonth}</p>
          {leadsDelta && (
            <p className={`text-xs mt-1 ${leadsDelta.up ? "text-emerald-600" : "text-rose-500"}`}>
              {leadsDelta.up ? "↑" : "↓"} {Math.abs(leadsDelta.pct)}% vs prior month
            </p>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">Pipeline Total</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Target className="h-4 w-4 text-indigo-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.pipelineTotal, "USD")}</p>
          <p className="text-xs text-gray-400 mt-1">{kpis.openOpportunities} open opportunities</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">Closed Won (month)</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.closedWonThisMonth, "USD")}</p>
          {wonDelta && (
            <p className={`text-xs mt-1 ${wonDelta.up ? "text-emerald-600" : "text-rose-500"}`}>
              {wonDelta.up ? "↑" : "↓"} {Math.abs(wonDelta.pct)}% vs prior month
            </p>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">AR Pending</span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <FileText className="h-4 w-4 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.arPending, "USD")}</p>
          <p className="text-xs text-gray-400 mt-1">{kpis.openTasks} tasks · {kpis.openSalesOrders} active SOs</p>
        </div>
      </div>

      {/* Revenue trend + Top opps */}
      <div className="grid grid-cols-5 gap-5">
        {/* Revenue trend */}
        <div className="col-span-2 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Consolidated revenue (6 months)</h2>
          {revenueTrend.length > 0 ? (
            <div className="space-y-2">
              {(() => {
                const max = Math.max(...revenueTrend.map((r) => r.revenue), 1);
                return revenueTrend.map((row) => (
                  <div key={row.month} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-14 shrink-0">{row.month}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min((row.revenue / max) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700 w-24 text-right shrink-0">
                      {formatCurrency(row.revenue, "USD")}
                    </span>
                  </div>
                ));
              })()}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No revenue data</p>
          )}
        </div>

        {/* Top opportunities */}
        <div className="col-span-3 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Top group opportunities</h2>
          {topOpps.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No open opportunities</p>
          ) : (
            <div className="space-y-2">
              {topOpps.map((opp) => (
                <div key={opp.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ background: (opp.company as any).primaryColor ?? "#059669" }}
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/${(opp.company as any).slug}/crm/opportunities/${opp.id}`}
                      className="text-xs font-medium text-gray-900 hover:text-emerald-600 truncate block"
                    >
                      {opp.name}
                    </Link>
                    <p className="text-xs text-gray-400 truncate">
                      {(opp.company as any).name} · {(opp as any).account?.name ?? "—"} · {(opp as any).stage?.name}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-gray-900">{formatCurrency(opp.amount, opp.currency)}</p>
                    <div className="flex items-center gap-1 mt-0.5 justify-end">
                      <Avatar src={(opp as any).owner?.avatarUrl} name={(opp as any).owner?.name ?? "?"} size="xs" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Company breakdown table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Performance by company</h2>
          <span className="text-xs text-gray-400">Current month</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Company</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Leads</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Pipeline</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Closed Won</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">AR Pend.</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tasks</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {breakdown.map((co) => (
              <tr key={co.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ background: co.primaryColor ?? "#059669" }}
                    />
                    <span className="font-medium text-gray-900 text-sm">{co.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-700">{co.leadsThisMonth}</td>
                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                  {co.pipelineValue > 0 ? formatCurrency(co.pipelineValue, co.currency ?? "USD") : "—"}
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-emerald-600">
                  {co.closedWonThisMonth > 0 ? formatCurrency(co.closedWonThisMonth, co.currency ?? "USD") : "—"}
                </td>
                <td className="px-4 py-3 text-right text-sm text-amber-600">
                  {co.arPending > 0 ? formatCurrency(co.arPending, co.currency ?? "USD") : "—"}
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-600">{co.openTasks}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/${co.slug}/dashboard`}
                    className="text-xs text-emerald-600 hover:underline font-medium"
                  >
                    View company →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t border-gray-200">
            <tr>
              <td className="px-5 py-3 text-xs font-bold text-gray-700 uppercase">Consolidated</td>
              <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">{kpis.totalLeadsThisMonth}</td>
              <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">{formatCurrency(kpis.pipelineTotal, "USD")}</td>
              <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">{formatCurrency(kpis.closedWonThisMonth, "USD")}</td>
              <td className="px-4 py-3 text-right text-sm font-bold text-amber-600">{formatCurrency(kpis.arPending, "USD")}</td>
              <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">{kpis.openTasks}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
