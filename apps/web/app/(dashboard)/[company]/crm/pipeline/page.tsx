import { redirect } from "next/navigation";
import { Target } from "lucide-react";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { pipelineService } from "@biogrow/crm-core";
import { EmptyState } from "@biogrow/ui/feedback/empty-state";
import { Badge } from "@biogrow/ui/components/badge";
import { Avatar } from "@biogrow/ui/components/avatar";
import { formatCurrency } from "@biogrow/ui/lib/utils";
import Link from "next/link";

export default async function PipelinePage({ params }: { params: { company: string } }) {

  const { company, permissions } = await resolveCompany(params.company);
  if (!hasPermission(permissions, Permissions.CRM_PIPELINE_VIEW)) {
    redirect(`/${params.company}/dashboard`);
  }

  const board = await pipelineService.getBoard(company.id);
  const totalOpps = board.reduce((s, col) => s + col.opportunities.length, 0);
  const totalValue = board.reduce((s, col) => s + col.totalValue, 0);

  return (
    <div className="space-y-5 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pipeline</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {totalOpps} opportunities · {formatCurrency(totalValue, company.currency)} total
          </p>
        </div>
      </div>

      {totalOpps === 0 ? (
        <EmptyState
          icon={<Target className="h-7 w-7" />}
          title="Empty pipeline"
          description="Create your first opportunity to start managing the pipeline."
        />
      ) : (
        /* Kanban Board */
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {board.map((col) => (
              <div key={col.id} className="w-72 flex flex-col">
                {/* Column header */}
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-t-lg border border-gray-200 border-b-0">
                  <div
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: col.color }}
                  />
                  <span className="text-sm font-semibold text-gray-700 flex-1 truncate">
                    {col.name}
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                    {col.opportunities.length}
                  </span>
                </div>
                <div className="text-xs text-gray-400 px-3 py-1.5 border border-gray-200 border-b-0 bg-white">
                  {formatCurrency(col.totalValue, company.currency)}
                </div>

                {/* Cards */}
                <div className="flex-1 border border-gray-200 rounded-b-lg bg-gray-50 p-2 space-y-2 min-h-[200px]">
                  {col.opportunities.map((opp) => (
                    <Link
                      key={opp.id}
                      href={`/${params.company}/crm/opportunities/${opp.id}`}
                      className="block bg-white rounded-lg border border-gray-200 p-3 hover:border-emerald-300 hover:shadow-sm transition-all"
                    >
                      <p className="text-sm font-medium text-gray-900 truncate">{opp.name}</p>
                      {opp.account && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{opp.account.name}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-semibold text-gray-800">
                          {formatCurrency(opp.amount, company.currency)}
                        </span>
                        <Avatar
                          src={(opp as any).owner?.avatarUrl}
                          name={(opp as any).owner?.name ?? "?"}
                          size="xs"
                        />
                      </div>
                      {opp.expectedCloseDate && (
                        <p className="text-[10px] text-gray-400 mt-1">
                          Close:{" "}
                          {new Date(opp.expectedCloseDate).toLocaleDateString("en", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
