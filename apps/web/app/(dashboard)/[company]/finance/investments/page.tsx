import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { investmentService } from "@biogrow/erp-core";
import { Button } from "@biogrow/ui/components/button";
import { Badge } from "@biogrow/ui/components/badge";
import { Avatar } from "@biogrow/ui/components/avatar";
import { formatCurrency, formatDate } from "@biogrow/ui/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PLANNED: { label: "Planned", color: "bg-gray-100 text-gray-700" },
  ACTIVE: { label: "Active", color: "bg-blue-100 text-blue-700" },
  ON_HOLD: { label: "On Hold", color: "bg-amber-100 text-amber-700" },
  COMPLETED: { label: "Completed", color: "bg-emerald-100 text-emerald-700" },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700" },
  WRITTEN_OFF: { label: "Written Off", color: "bg-rose-100 text-rose-700" },
};

const TYPE_CONFIG: Record<string, { label: string }> = {
  EQUIPMENT: { label: "Equipment" },
  PROPERTY: { label: "Property" },
  TECHNOLOGY: { label: "Technology" },
  RESEARCH: { label: "R&D" },
  INVENTORY_EXPANSION: { label: "Inventory" },
  MARKETING: { label: "Marketing" },
  TRAINING: { label: "Training" },
  OTHER: { label: "Other" },
};

const RISK_CONFIG: Record<string, { label: string; color: string }> = {
  LOW: { label: "Low", color: "bg-emerald-100 text-emerald-700" },
  MEDIUM: { label: "Medium", color: "bg-amber-100 text-amber-700" },
  HIGH: { label: "High", color: "bg-orange-100 text-orange-700" },
  VERY_HIGH: { label: "Very High", color: "bg-rose-100 text-rose-700" },
};

export default async function InvestmentsPage({ params }: { params: { company: string } }) {
  const { company, permissions } = await resolveCompany(params.company);

  const canView = hasPermission(permissions, Permissions.ERP_INVESTMENTS_VIEW);
  const canCreate = hasPermission(permissions, Permissions.ERP_INVESTMENTS_CREATE);

  if (!canView) {
    redirect(`/${params.company}/dashboard`);
  }

  const [summary, { investments }] = await Promise.all([
    investmentService.getSummary(company.id),
    investmentService.list({ companyId: company.id, pageSize: 50 }),
  ]);

  const currency = company.currency ?? "USD";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Investments</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track and manage company investments</p>
        </div>
        {canCreate && (
          <Link href={`/${params.company}/finance/investments/new`}>
            <Button>
              <Plus className="h-4 w-4 mr-1" />
              New Investment
            </Button>
          </Link>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-medium text-gray-500">Total Invested</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.totalInvested, currency)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-medium text-gray-500">Active</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{summary.activeCount}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-medium text-gray-500">Expected Return</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.totalExpectedReturn, currency)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium text-gray-500">Actual Return</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.totalActualReturn, currency)}</p>
        </div>
      </div>

      {/* By Type Summary */}
      {summary.byType.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Investments by Type</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {summary.byType.map((item) => (
              <div key={item.type} className="space-y-1">
                <p className="text-xs text-gray-500">{TYPE_CONFIG[item.type]?.label ?? item.type}</p>
                <p className="text-sm font-bold text-gray-900">{formatCurrency(item.amount, currency)}</p>
                <p className="text-xs text-gray-400">{item.count} investments</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Investments List */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">All Investments</h2>
        </div>
        {investments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No investments yet</p>
            {canCreate && (
              <Link href={`/${params.company}/finance/investments/new`} className="text-sm text-emerald-600 hover:underline mt-2 block">
                Create your first investment
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {investments.map((inv: { id: string; name: string; type: string; status: string; riskLevel: string; amount: number; currency: string; investedAt: Date; expectedRoiPct: number | null; owner: { id: string; name: string; avatarUrl: string | null } }) => {
              const status = STATUS_CONFIG[inv.status] ?? { label: inv.status, color: "bg-gray-100 text-gray-700" };
              const type = TYPE_CONFIG[inv.type] ?? { label: inv.type };
              const risk = RISK_CONFIG[inv.riskLevel] ?? { label: inv.riskLevel, color: "bg-gray-100 text-gray-700" };

              return (
                <Link
                  key={inv.id}
                  href={`/${params.company}/finance/investments/${inv.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={inv.owner.avatarUrl}
                      name={inv.owner.name}
                      className="h-9 w-9"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{inv.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500">{type.label}</span>
                        <span className="text-xs text-gray-300">•</span>
                        <span className="text-xs text-gray-500">{formatDate(inv.investedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(inv.amount, inv.currency)}</p>
                      {inv.expectedRoiPct !== null && inv.expectedRoiPct !== undefined && (
                        <p className="text-xs text-gray-500">ROI: {inv.expectedRoiPct.toFixed(1)}%</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <Badge className={status.color}>{status.label}</Badge>
                      <Badge className={risk.color}>{risk.label}</Badge>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}