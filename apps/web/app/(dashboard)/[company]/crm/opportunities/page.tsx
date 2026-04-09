import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Target } from "lucide-react";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { opportunitiesService } from "@biogrow/crm-core";
import { Button } from "@biogrow/ui/components/button";
import { Badge } from "@biogrow/ui/components/badge";
import { EmptyState } from "@biogrow/ui/feedback/empty-state";
import { Avatar } from "@biogrow/ui/components/avatar";
import { formatCurrency, formatDate } from "@biogrow/ui/lib/utils";

const FORECAST_LABEL: Record<string, string> = {
  PIPELINE: "Pipeline",
  BEST_CASE: "Best Case",
  COMMIT: "Commit",
  CLOSED_WON: "Won",
  CLOSED_LOST: "Lost",
  OMITTED: "Omitted",
};

const FORECAST_VARIANT: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
  PIPELINE: "secondary",
  BEST_CASE: "warning",
  COMMIT: "primary",
  CLOSED_WON: "success",
  CLOSED_LOST: "danger",
  OMITTED: "default",
};

export default async function OpportunitiesPage({ params }: { params: { company: string } }) {

  const { company, permissions } = await resolveCompany(params.company);
  if (!hasPermission(permissions, Permissions.CRM_OPPORTUNITIES_VIEW)) {
    redirect(`/${params.company}/dashboard`);
  }

  const { opportunities, total } = await opportunitiesService.list({
    companyId: company.id,
    pageSize: 50,
  });
  const canCreate = hasPermission(permissions, Permissions.CRM_OPPORTUNITIES_CREATE);
  const totalValue = opportunities.reduce((s, o) => s + o.amount, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Opportunities</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} opportunities · {formatCurrency(totalValue, company.currency)} in pipeline
          </p>
        </div>
        {canCreate && (
          <Button size="sm"><Plus className="h-4 w-4" />New Opportunity</Button>
        )}
      </div>

      {opportunities.length === 0 ? (
        <EmptyState
          icon={<Target className="h-7 w-7" />}
          title="No opportunities yet"
          description="Create your first opportunity or convert a lead."
          action={canCreate ? <Button size="sm"><Plus className="h-4 w-4" />Create opportunity</Button> : undefined}
        />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Opportunity</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Stage</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Forecast</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Est. Close</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {opportunities.map((opp) => (
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
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: (opp as any).stage?.color ?? "#6b7280" }}
                      />
                      <span className="text-xs text-gray-600">{(opp as any).stage?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900 tabular-nums">
                    {formatCurrency(opp.amount, company.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={FORECAST_VARIANT[opp.forecastCategory] ?? "default"}>
                      {FORECAST_LABEL[opp.forecastCategory] ?? opp.forecastCategory}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {opp.expectedCloseDate
                      ? formatDate(opp.expectedCloseDate, { month: "short", day: "numeric", year: "numeric" })
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar src={(opp as any).owner?.avatarUrl} name={(opp as any).owner?.name ?? "?"} size="xs" />
                      <span className="text-xs text-gray-500">{(opp as any).owner?.name}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
