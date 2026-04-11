"use client";

import { useState } from "react";
import {
  Plus,
  Phone,
  Target,
  CheckSquare,
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Mail,
  Calendar,
  FileText,
} from "lucide-react";
import { Card } from "@biogrow/ui/components/card";
import { Button } from "@biogrow/ui/components/button";
import { Badge } from "@biogrow/ui/components/badge";
import { QuickLeadModal } from "./quick-lead-modal";
import { QuickOpportunityModal } from "./quick-opportunity-modal";
import { QuickTaskModal } from "./quick-task-modal";
import { LogActivityModal } from "@/components/crm/log-activity-modal";
import { formatDistanceToNow } from "date-fns";

type Modal = "lead" | "opportunity" | "task" | "activity" | null;

interface KPIs {
  newLeadsThisMonth: number;
  newLeadsLastMonth: number;
  pipelineValue: number;
  pipelineWeightedValue: number;
  closedWonThisMonth: number;
  closedWonLastMonth: number;
  conversionRate: number;
  activitiesThisWeek: number;
  openOpportunities: number;
  openTasks: number;
}

interface PipelineStage {
  stageId: string;
  stageName: string;
  stageColor: string | null;
  order: number;
  count: number;
  totalValue: number;
  weightedValue: number;
}

interface Activity {
  id: string;
  type: string;
  subject: string;
  occurredAt: Date | string;
  user?: { id: string; name: string; avatarUrl: string | null } | null;
  lead?: { id: string; firstName: string; lastName: string } | null;
  account?: { id: string; name: string } | null;
  opportunity?: { id: string; name: string } | null;
}

interface Stage {
  id: string;
  name: string;
  probability: number;
  isWon: boolean;
  isLost: boolean;
}

interface DashboardClientProps {
  company: { id: string; name: string; slug: string };
  kpis: KPIs | null;
  pipeline: PipelineStage[];
  recentActivities: Activity[];
  stages: Stage[];
  permissions: {
    canCreateLead: boolean;
    canCreateOpp: boolean;
    canCreateTask: boolean;
  };
}

function formatCurrency(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function DeltaBadge({ current, previous, suffix = "" }: { current: number; previous: number; suffix?: string }) {
  if (previous === 0) return null;
  const delta = current - previous;
  const pct = Math.round((delta / previous) * 100);
  const positive = delta >= 0;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-medium ${positive ? "text-emerald-600" : "text-red-500"}`}>
      {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(pct)}%{suffix}
    </span>
  );
}

const ACTIVITY_ICON: Record<string, typeof Phone> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Users,
  NOTE: FileText,
  TASK: CheckSquare,
};

const ACTIVITY_COLOR: Record<string, string> = {
  CALL: "bg-blue-100 text-blue-600",
  EMAIL: "bg-purple-100 text-purple-600",
  MEETING: "bg-amber-100 text-amber-600",
  NOTE: "bg-gray-100 text-gray-600",
  TASK: "bg-emerald-100 text-emerald-600",
};

export function DashboardClient({
  company,
  kpis,
  pipeline,
  recentActivities,
  stages,
  permissions,
}: DashboardClientProps) {
  const [activeModal, setActiveModal] = useState<Modal>(null);

  const pipelineMax = pipeline.length > 0
    ? Math.max(...pipeline.map((s) => s.totalValue), 1)
    : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{company.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Overview · {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {permissions.canCreateLead && (
            <Button size="sm" variant="outline" onClick={() => setActiveModal("lead")}>
              <Users className="h-3.5 w-3.5" />
              New Lead
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => setActiveModal("activity")}>
            <Phone className="h-3.5 w-3.5" />
            Log Activity
          </Button>
          {permissions.canCreateOpp && (
            <Button size="sm" variant="outline" onClick={() => setActiveModal("opportunity")}>
              <Target className="h-3.5 w-3.5" />
              New Opportunity
            </Button>
          )}
          {permissions.canCreateTask && (
            <Button size="sm" onClick={() => setActiveModal("task")}>
              <Plus className="h-3.5 w-3.5" />
              New Task
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      {kpis ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">New Leads</span>
              <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpis.newLeadsThisMonth}</p>
            <div className="mt-1">
              <DeltaBadge current={kpis.newLeadsThisMonth} previous={kpis.newLeadsLastMonth} />
              <span className="text-xs text-gray-400 ml-1">vs last month</span>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pipeline</span>
              <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Target className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.pipelineValue)}</p>
            <p className="text-xs text-gray-400 mt-1">
              {kpis.openOpportunities} open · weighted {formatCurrency(kpis.pipelineWeightedValue)}
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Closed Won</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.closedWonThisMonth)}</p>
            <div className="mt-1">
              <DeltaBadge current={kpis.closedWonThisMonth} previous={kpis.closedWonLastMonth} />
              <span className="text-xs text-gray-400 ml-1">vs last month</span>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Activity</span>
              <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Activity className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpis.activitiesThisWeek}</p>
            <p className="text-xs text-gray-400 mt-1">
              this week · {kpis.openTasks} open tasks
            </p>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-5 h-[100px] animate-pulse bg-gray-50" />
          ))}
        </div>
      )}

      {/* Pipeline + Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline by Stage */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Sales Pipeline</h3>
            {kpis && (
              <Badge variant="secondary" className="text-xs">
                {kpis.openOpportunities} opportunities
              </Badge>
            )}
          </div>

          {pipeline.length === 0 ? (
            <div className="py-10 text-center">
              <Target className="h-8 w-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No open opportunities</p>
              {permissions.canCreateOpp && (
                <button
                  onClick={() => setActiveModal("opportunity")}
                  className="mt-3 text-xs text-emerald-600 hover:underline"
                >
                  Create first opportunity
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {pipeline.map((stage) => (
                <div key={stage.stageId}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: stage.stageColor ?? "#94a3b8" }}
                      />
                      <span className="text-xs text-gray-600">{stage.stageName}</span>
                      <span className="text-xs text-gray-400">({stage.count})</span>
                    </div>
                    <span className="text-xs font-medium text-gray-900">
                      {formatCurrency(stage.totalValue)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(stage.totalValue / pipelineMax) * 100}%`,
                        backgroundColor: stage.stageColor ?? "#94a3b8",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Activities */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
            <button
              onClick={() => setActiveModal("activity")}
              className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Log
            </button>
          </div>

          {recentActivities.length === 0 ? (
            <div className="py-10 text-center">
              <Activity className="h-8 w-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No activity logged yet</p>
              <button
                onClick={() => setActiveModal("activity")}
                className="mt-3 text-xs text-emerald-600 hover:underline"
              >
                Log first activity
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity) => {
                const Icon = ACTIVITY_ICON[activity.type] ?? FileText;
                const colorClass = ACTIVITY_COLOR[activity.type] ?? "bg-gray-100 text-gray-600";
                const entityLabel =
                  activity.lead
                    ? `${activity.lead.firstName} ${activity.lead.lastName}`
                    : activity.account?.name ?? activity.opportunity?.name ?? null;

                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{activity.subject}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {activity.user?.name}
                        {entityLabel ? ` · ${entityLabel}` : ""}
                        {" · "}
                        {formatDistanceToNow(new Date(activity.occurredAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Open Tasks summary */}
      {kpis && kpis.openTasks > 0 && (
        <Card className="p-4 flex items-center justify-between bg-amber-50 border-amber-200">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <CheckSquare className="h-4 w-4 text-amber-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-900">
                {kpis.openTasks} open {kpis.openTasks === 1 ? "task" : "tasks"} pending
              </p>
              <p className="text-xs text-amber-700">Review and close outstanding tasks</p>
            </div>
          </div>
          {permissions.canCreateTask && (
            <Button size="sm" variant="outline" onClick={() => setActiveModal("task")}
              className="border-amber-300 text-amber-800 hover:bg-amber-100">
              <Plus className="h-3.5 w-3.5" />
              Add Task
            </Button>
          )}
        </Card>
      )}

      {/* Modals */}
      {activeModal === "lead" && (
        <QuickLeadModal
          companyId={company.id}
          companySlug={company.slug}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === "opportunity" && (
        <QuickOpportunityModal
          companyId={company.id}
          companySlug={company.slug}
          stages={stages}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === "task" && (
        <QuickTaskModal
          companyId={company.id}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === "activity" && (
        <LogActivityModal
          companyId={company.id}
          companySlug={company.slug}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
