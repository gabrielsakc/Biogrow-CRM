import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Calendar, DollarSign, Target, TrendingUp, AlertTriangle, Plus } from "lucide-react";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { investmentService } from "@biogrow/erp-core";
import { Button } from "@biogrow/ui/components/button";
import { Badge } from "@biogrow/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@biogrow/ui/components/card";
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
  RESEARCH: { label: "Research & Development" },
  INVENTORY_EXPANSION: { label: "Inventory Expansion" },
  MARKETING: { label: "Marketing" },
  TRAINING: { label: "Training" },
  OTHER: { label: "Other" },
};

const RISK_CONFIG: Record<string, { label: string; color: string }> = {
  LOW: { label: "Low Risk", color: "bg-emerald-100 text-emerald-700" },
  MEDIUM: { label: "Medium Risk", color: "bg-amber-100 text-amber-700" },
  HIGH: { label: "High Risk", color: "bg-orange-100 text-orange-700" },
  VERY_HIGH: { label: "Very High Risk", color: "bg-rose-100 text-rose-700" },
};

const TRANSACTION_TYPE_CONFIG: Record<string, { label: string; color: string; sign: number }> = {
  DISBURSEMENT: { label: "Disbursement", color: "bg-red-100 text-red-700", sign: -1 },
  RETURN: { label: "Return", color: "bg-emerald-100 text-emerald-700", sign: 1 },
  ADJUSTMENT: { label: "Adjustment", color: "bg-blue-100 text-blue-700", sign: 1 },
};

export default async function InvestmentDetailPage({ params }: { params: { company: string; id: string } }) {
  const { company, permissions } = await resolveCompany(params.company);

  const canView = hasPermission(permissions, Permissions.ERP_INVESTMENTS_VIEW);
  const canEdit = hasPermission(permissions, Permissions.ERP_INVESTMENTS_EDIT);

  if (!canView) {
    redirect(`/${params.company}/dashboard`);
  }

  const investment = await investmentService.getById(params.id, company.id);

  if (!investment) {
    redirect(`/${params.company}/finance/investments`);
  }

  const currency = investment.currency ?? company.currency ?? "USD";
  const status = STATUS_CONFIG[investment.status] ?? { label: investment.status, color: "bg-gray-100 text-gray-700" };
  const type = TYPE_CONFIG[investment.type] ?? { label: investment.type };
  const risk = RISK_CONFIG[investment.riskLevel] ?? { label: investment.riskLevel, color: "bg-gray-100 text-gray-700" };

  // Calculate ROI
  const roiDifference = investment.actualReturn !== null && investment.actualReturn !== undefined
    ? ((investment.actualReturn - investment.amount) / investment.amount * 100).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${params.company}/finance/investments`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{investment.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-gray-500">{type.label}</span>
              <Badge className={status.color}>{status.label}</Badge>
              <Badge className={risk.color}>{risk.label}</Badge>
            </div>
          </div>
        </div>
        {canEdit && (
          <Link href={`/${params.company}/finance/investments/${params.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </Link>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Investment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Investment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Amount Invested</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(investment.amount, currency)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Investment Date</p>
                  <p className="text-lg font-bold text-gray-900">{formatDate(investment.investedAt)}</p>
                </div>
                {investment.startDate && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Start Date</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(investment.startDate)}</p>
                  </div>
                )}
                {investment.maturityDate && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Maturity Date</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(investment.maturityDate)}</p>
                  </div>
                )}
              </div>

              {investment.description && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-sm text-gray-700">{investment.description}</p>
                </div>
              )}

              {investment.notes && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{investment.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ROI Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Return on Investment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Expected Return</p>
                  <p className="text-lg font-bold text-gray-900">
                    {investment.expectedReturn !== null && investment.expectedReturn !== undefined
                      ? formatCurrency(investment.expectedReturn, currency)
                      : "—"}
                  </p>
                  {investment.expectedRoiPct !== null && investment.expectedRoiPct !== undefined && (
                    <p className="text-xs text-gray-500">ROI: {investment.expectedRoiPct.toFixed(1)}%</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Actual Return</p>
                  <p className="text-lg font-bold text-gray-900">
                    {investment.actualReturn !== null && investment.actualReturn !== undefined
                      ? formatCurrency(investment.actualReturn, currency)
                      : "—"}
                  </p>
                  {investment.actualRoiPct !== null && investment.actualRoiPct !== undefined && (
                    <p className="text-xs text-gray-500">ROI: {investment.actualRoiPct.toFixed(1)}%</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Performance</p>
                  {roiDifference !== null ? (
                    <p className={`text-lg font-bold ${parseFloat(roiDifference) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {parseFloat(roiDifference) >= 0 ? "+" : ""}{roiDifference}%
                    </p>
                  ) : (
                    <p className="text-lg font-bold text-gray-400">—</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {!investment.transactions || investment.transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No transactions recorded</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {investment.transactions.map((tx: { id: string; type: string; amount: number; transactionDate: Date; description: string | null }) => {
                    const txType = TRANSACTION_TYPE_CONFIG[tx.type] ?? { label: tx.type, color: "bg-gray-100 text-gray-700", sign: 1 };
                    return (
                      <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3">
                          <Badge className={txType.color}>{txType.label}</Badge>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {txType.sign === 1 ? "+" : "-"}{formatCurrency(tx.amount, investment.currency)}
                            </p>
                            {tx.description && (
                              <p className="text-xs text-gray-500">{tx.description}</p>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">{formatDate(tx.transactionDate)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Owner */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Owner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar
                  src={investment.owner.avatarUrl}
                  name={investment.owner.name}
                  className="h-10 w-10"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{investment.owner.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <div>
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(investment.createdAt)}</p>
                  </div>
                </div>
                {investment.startDate && (
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500">Started</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(investment.startDate)}</p>
                    </div>
                  </div>
                )}
                {investment.maturityDate && (
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <div>
                      <p className="text-xs text-gray-500">Matures</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(investment.maturityDate)}</p>
                    </div>
                  </div>
                )}
                {investment.endDate && (
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Ended</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(investment.endDate)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Risk Level</span>
                  <Badge className={risk.color}>{risk.label}</Badge>
                </div>
                {investment.expectedRoiPct !== null && investment.expectedRoiPct !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Expected ROI</span>
                    <span className="text-sm font-medium text-gray-900">{investment.expectedRoiPct.toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}