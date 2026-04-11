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
  FileText,
  Zap,
  Minus,
} from "lucide-react";
import { Card } from "@biogrow/ui/components/card";
import { Button } from "@biogrow/ui/components/button";
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

interface ActivityItem {
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
  recentActivities: ActivityItem[];
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

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const ACTIVITY_ICON: Record<string, typeof Phone> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Users,
  NOTE: FileText,
  TASK: CheckSquare,
};

const ACTIVITY_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  CALL:    { bg: "bg-blue-50",   text: "text-blue-600",   dot: "bg-blue-400" },
  EMAIL:   { bg: "bg-violet-50", text: "text-violet-600", dot: "bg-violet-400" },
  MEETING: { bg: "bg-amber-50",  text: "text-amber-600",  dot: "bg-amber-400" },
  NOTE:    { bg: "bg-gray-100",  text: "text-gray-600",   dot: "bg-gray-400" },
  TASK:    { bg: "bg-emerald-50",text: "text-emerald-600",dot: "bg-emerald-400" },
};

const KPI_CONFIG = [
  {
    key: "leads",
    label: "New Leads",
    icon: Users,
    accentColor: "bg-blue-500",
    iconBg: "bg-blue-50",
    iconText: "text-blue-600",
    getValue: (k: KPIs) => k.newLeadsThisMonth.toString(),
    getDelta: (k: KPIs) => ({ current: k.newLeadsThisMonth, previous: k.newLeadsLastMonth }),
    sub: (k: KPIs) => `${k.newLeadsLastMonth} last month`,
  },
  {
    key: "pipeline",
    label: "Pipeline",
    icon: Target,
    accentColor: "bg-amber-500",
    iconBg: "bg-amber-50",
    iconText: "text-amber-600",
    getValue: (k: KPIs) => formatCurrency(k.pipelineValue),
    getDelta: null,
    sub: (k: KPIs) => `${k.openOpportunities} open · weighted ${formatCurrency(k.pipelineWeightedValue)}`,
  },
  {
    key: "revenue",
    label: "Closed Won",
    icon: DollarSign,
    accentColor: "bg-emerald-500",
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
    getValue: (k: KPIs) => formatCurrency(k.closedWonThisMonth),
    getDelta: (k: KPIs) => ({ current: k.closedWonThisMonth, previous: k.closedWonLastMonth }),
    sub: (k: KPIs) => `vs ${formatCurrency(k.closedWonLastMonth)} last month`,
  },
  {
    key: "activity",
    label: "Activity",
    icon: Activity,
    accentColor: "bg-violet-500",
    iconBg: "bg-violet-50",
    iconText: "text-violet-600",
    getValue: (k: KPIs) => k.activitiesThisWeek.toString(),
    getDelta: null,
    sub: (k: KPIs) => `this week · ${k.openTasks} tasks open`,
  },
];

function DeltaChip({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return null;
  const delta = current - previous;
  const pct = Math.abs(Math.round((delta / previous) * 100));
  const up = delta >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        up ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
      }`}
    >
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {pct}%
    </span>
  );
}

export function DashboardClient({
  company,
  kpis,
  pipeline,
  recentActivities,
  stages,
  permissions,
}: DashboardClientProps) {
  const [activeModal, setActiveModal] = useState<Modal>(null);

  const pipelineMax = pipeline.length > 0 ? Math.max(...pipeline.map((s) => s.totalValue), 1) : 1;

  return (
    <div className="space-y-6">

      {/* ── Hero Header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-600 mb-0.5">{getGreeting()} ·{" "}
            <span className="text-gray-400 font-normal">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </span>
          </p>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{company.name}</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Here's what's happening with your business today.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {permissions.canCreateLead && (
            <button
              onClick={() => setActiveModal("lead")}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all"
            >
              <Users className="h-3.5 w-3.5 text-blue-500" />
              New Lead
            </button>
          )}
          <button
            onClick={() => setActiveModal("activity")}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all"
          >
            <Phone className="h-3.5 w-3.5 text-violet-500" />
            Log Activity
          </button>
          {permissions.canCreateOpp && (
            <button
              onClick={() => setActiveModal("opportunity")}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all"
            >
              <Target className="h-3.5 w-3.5 text-amber-500" />
              New Opportunity
            </button>
          )}
          {permissions.canCreateTask && (
            <button
              onClick={() => setActiveModal("task")}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              New Task
            </button>
          )}
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis ? (
          KPI_CONFIG.map((cfg) => {
            const Icon = cfg.icon;
            const delta = cfg.getDelta?.(kpis);
            return (
              <div
                key={cfg.key}
                className="relative bg-white rounded-xl border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
              >
                {/* Accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 ${cfg.accentColor}`} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`h-9 w-9 rounded-lg ${cfg.iconBg} flex items-center justify-center`}>
                      <Icon className={`h-4.5 w-4.5 ${cfg.iconText}`} style={{ width: 18, height: 18 }} />
                    </div>
                    {delta && <DeltaChip current={delta.current} previous={delta.previous} />}
                  </div>
                  <p className="text-2xl font-bold text-gray-900 tracking-tight tabular-nums">
                    {cfg.getValue(kpis)}
                  </p>
                  <p className="text-xs font-medium text-gray-400 mt-0.5 uppercase tracking-wide">
                    {cfg.label}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1 truncate">{cfg.sub(kpis)}</p>
                </div>
              </div>
            );
          })
        ) : (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 h-[120px] animate-pulse" />
          ))
        )}
      </div>

      {/* ── Pipeline + Activity ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Sales Pipeline */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Sales Pipeline</h3>
              {kpis && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {kpis.openOpportunities} opportunities · {formatCurrency(kpis.pipelineValue)} total
                </p>
              )}
            </div>
            {permissions.canCreateOpp && (
              <button
                onClick={() => setActiveModal("opportunity")}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium hover:underline transition-colors"
              >
                + Add
              </button>
            )}
          </div>

          {pipeline.length === 0 ? (
            <div className="py-10 text-center">
              <div className="h-12 w-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-3">
                <Target className="h-5 w-5 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">No open opportunities</p>
              <p className="text-xs text-gray-400 mt-1">Create your first opportunity to get started.</p>
              {permissions.canCreateOpp && (
                <button
                  onClick={() => setActiveModal("opportunity")}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create opportunity
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3.5">
              {pipeline.map((stage) => {
                const pct = Math.round((stage.totalValue / pipelineMax) * 100);
                return (
                  <div key={stage.stageId}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: stage.stageColor ?? "#94a3b8" }}
                        />
                        <span className="text-xs font-medium text-gray-700">{stage.stageName}</span>
                        <span className="text-[11px] text-gray-400">({stage.count})</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-900">
                        {formatCurrency(stage.totalValue)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: stage.stageColor ?? "#94a3b8",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
              <p className="text-xs text-gray-400 mt-0.5">Latest interactions across the team</p>
            </div>
            <button
              onClick={() => setActiveModal("activity")}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium hover:underline transition-colors"
            >
              + Log
            </button>
          </div>

          {recentActivities.length === 0 ? (
            <div className="py-10 text-center">
              <div className="h-12 w-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-3">
                <Activity className="h-5 w-5 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">No activity yet</p>
              <p className="text-xs text-gray-400 mt-1">Log your first call, email, or meeting.</p>
              <button
                onClick={() => setActiveModal("activity")}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Log first activity
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {recentActivities.map((activity) => {
                const Icon = ACTIVITY_ICON[activity.type] ?? FileText;
                const cfg = ACTIVITY_CONFIG[activity.type] ?? ACTIVITY_CONFIG.NOTE;
                const entity =
                  activity.lead
                    ? `${activity.lead.firstName} ${activity.lead.lastName}`
                    : activity.account?.name ?? activity.opportunity?.name ?? null;

                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}>
                      <Icon className={`h-3.5 w-3.5 ${cfg.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{activity.subject}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                        {activity.user?.name}
                        {entity ? ` · ${entity}` : ""}
                        {" · "}
                        {formatDistanceToNow(new Date(activity.occurredAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Open Tasks Banner ───────────────────────────────────────────── */}
      {kpis && kpis.openTasks > 0 && (
        <div className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center">
              <Zap className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">
                {kpis.openTasks} pending {kpis.openTasks === 1 ? "task" : "tasks"}
              </p>
              <p className="text-xs text-amber-700/70">Review and close outstanding tasks to keep the pipeline moving.</p>
            </div>
          </div>
          {permissions.canCreateTask && (
            <button
              onClick={() => setActiveModal("task")}
              className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium bg-white border border-amber-200 text-amber-800 hover:bg-amber-50 shadow-sm transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Task
            </button>
          )}
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {activeModal === "lead" && (
        <QuickLeadModal companyId={company.id} companySlug={company.slug} onClose={() => setActiveModal(null)} />
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
        <QuickTaskModal companyId={company.id} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "activity" && (
        <LogActivityModal companyId={company.id} companySlug={company.slug} onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}
