import { redirect } from "next/navigation";
import Link from "next/link";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { dashboardService } from "@biogrow/crm-core";
import { Badge } from "@biogrow/ui/components/badge";
import { Avatar } from "@biogrow/ui/components/avatar";
import { formatCurrency, formatDate } from "@biogrow/ui/lib/utils";

const CATEGORY_META: Record<string, { label: string; variant: "default" | "primary" | "secondary" | "success" | "warning" | "danger"; color: string }> = {
  PIPELINE: { label: "Pipeline", variant: "secondary", color: "bg-gray-400" },
  BEST_CASE: { label: "Best Case", variant: "warning", color: "bg-amber-400" },
  COMMIT: { label: "Commit", variant: "primary", color: "bg-indigo-500" },
  CLOSED_WON: { label: "Closed Won", variant: "success", color: "bg-emerald-500" },
};

export default async function ForecastPage({ params }: { params: { company: string } }) {

  const { company, permissions } = await resolveCompany(params.company);
  if (!hasPermission(permissions, Permissions.CRM_FORECAST_VIEW)) {
    redirect(`/${params.company}/dashboard`);
  }

  const { summary, opportunities } = await dashboardService.getForecast(company.id);
  const currency = "USD";

  const totalPipeline = summary.reduce((s, c) => s + (c.category !== "CLOSED_WON" ? c.totalAmount : 0), 0);
  const totalCommit = summary.find((c) => c.category === "COMMIT")?.totalAmount ?? 0;
  const totalClosedWon = summary.find((c) => c.category === "CLOSED_WON")?.totalAmount ?? 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Forecast</h1>
        <p className="text-sm text-gray-500 mt-0.5">Revenue projection by forecast category</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {summary.map((row) => {
          const meta = CATEGORY_META[row.category];
          return (
            <div key={row.category} className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${meta?.color ?? "bg-gray-400"}`} />
                <span className="text-xs font-medium text-gray-500">{meta?.label ?? row.category}</span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(row.totalAmount, currency)}
              </p>
              <p className="text-xs text-gray-400">{row.count} opportunities</p>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">Monthly summary</span>
          <span className="text-gray-400 text-xs">Total pipeline: {formatCurrency(totalPipeline, currency)}</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Commit</span>
              <span className="font-medium text-gray-700">{formatCurrency(totalCommit, currency)}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: totalPipeline > 0 ? `${Math.min((totalCommit / totalPipeline) * 100, 100)}%` : "0%" }}
              />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Closed Won</span>
              <span className="font-medium text-gray-700">{formatCurrency(totalClosedWon, currency)}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: totalPipeline > 0 ? `${Math.min((totalClosedWon / totalPipeline) * 100, 100)}%` : "0%" }}
              />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Win rate</span>
              <span className="font-medium text-gray-700">
                {totalPipeline > 0
                  ? `${Math.round((totalClosedWon / (totalPipeline + totalClosedWon)) * 100)}%`
                  : "—"}
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{
                  width: (totalPipeline + totalClosedWon) > 0
                    ? `${Math.min((totalClosedWon / (totalPipeline + totalClosedWon)) * 100, 100)}%`
                    : "0%",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Opportunities table */}
      {opportunities.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Open opportunities</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Opportunity</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Stage</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Category</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Est. Close</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {opportunities.map((opp) => {
                const catMeta = CATEGORY_META[(opp as any).forecastCategory ?? "PIPELINE"];
                return (
                  <tr key={opp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/${params.company}/crm/opportunities/${opp.id}`}
                        className="font-medium text-gray-900 hover:text-emerald-600 transition-colors"
                      >
                        {opp.name}
                      </Link>
                      {(opp as any).account && (
                        <p className="text-xs text-gray-400 mt-0.5">{(opp as any).account.name}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{(opp as any).stage?.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={catMeta?.variant ?? "default"}>
                        {catMeta?.label ?? (opp as any).forecastCategory}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(opp.amount, opp.currency)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {opp.expectedCloseDate
                        ? formatDate(opp.expectedCloseDate, { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={(opp as any).owner?.avatarUrl}
                          name={(opp as any).owner?.name ?? "?"}
                          size="xs"
                        />
                        <span className="text-xs text-gray-500">{(opp as any).owner?.name}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
