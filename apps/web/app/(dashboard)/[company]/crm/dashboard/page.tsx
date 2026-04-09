import { redirect } from "next/navigation";
import { Users, Target, DollarSign, TrendingUp, Activity, CheckSquare } from "lucide-react";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { dashboardService, activitiesService } from "@biogrow/crm-core";
import { Card, CardContent, CardHeader, CardTitle } from "@biogrow/ui/components/card";
import { KPICard } from "@/components/crm/kpi-card";
import { ActivityFeed } from "@/components/crm/activity-feed";
import { CRMFunnelChart } from "@/components/crm/charts/funnel-chart";
import { RevenueTrendChart } from "@/components/crm/charts/revenue-trend-chart";
import { RepPerformanceTable } from "@/components/crm/rep-performance-table";
import { formatCurrency } from "@biogrow/ui/lib/utils";

export async function generateMetadata({ params }: { params: { company: string } }) {
  return { title: `CRM Dashboard — ${params.company}` };
}

export default async function CRMDashboardPage({
  params,
}: {
  params: { company: string };
}) {

  const { company, permissions } = await resolveCompany(params.company);

  if (!hasPermission(permissions, Permissions.CRM_PIPELINE_VIEW)) {
    redirect(`/${params.company}/dashboard`);
  }

  const [kpis, pipelineByStage, revenueByMonth, repPerformance, recentActivities] =
    await Promise.all([
      dashboardService.getKPIs(company.id),
      dashboardService.getPipelineByStage(company.id),
      dashboardService.getRevenueByMonth(company.id, 6),
      dashboardService.getRepPerformance(company.id),
      activitiesService.listRecent(company.id, 15),
    ]);

  const leadsGrowth =
    kpis.newLeadsLastMonth > 0
      ? Math.round(((kpis.newLeadsThisMonth - kpis.newLeadsLastMonth) / kpis.newLeadsLastMonth) * 100)
      : undefined;

  const revenueGrowth =
    kpis.closedWonLastMonth > 0
      ? Math.round(((kpis.closedWonThisMonth - kpis.closedWonLastMonth) / kpis.closedWonLastMonth) * 100)
      : undefined;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">CRM Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">{company.name} · Monthly sales summary</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="New Leads"
          value={kpis.newLeadsThisMonth}
          format="number"
          icon={Users}
          deltaPercent={leadsGrowth}
        />
        <KPICard
          title="Open Pipeline"
          value={kpis.pipelineValue}
          format="currency"
          currency={company.currency}
          icon={Target}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <KPICard
          title="Closed Won"
          value={kpis.closedWonThisMonth}
          format="currency"
          currency={company.currency}
          icon={DollarSign}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          deltaPercent={revenueGrowth}
        />
        <KPICard
          title="Conversion Rate"
          value={kpis.conversionRate}
          format="percent"
          icon={TrendingUp}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
      </div>

      {/* Secondary KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Open Opportunities</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{kpis.openOpportunities}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Weighted Pipeline</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(kpis.pipelineWeightedValue, company.currency)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Activities This Week</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{kpis.activitiesThisWeek}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Open Tasks</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{kpis.openTasks}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pipeline by Stage</CardTitle>
            <p className="text-xs text-gray-400">Total value of open opportunities</p>
          </CardHeader>
          <CardContent>
            <CRMFunnelChart data={pipelineByStage} currency={company.currency} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Revenue Trend</CardTitle>
            <p className="text-xs text-gray-400">Closed won vs pipeline — last 6 months</p>
          </CardHeader>
          <CardContent>
            <RevenueTrendChart data={revenueByMonth} currency={company.currency} />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Rep performance + Activity feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Rep Performance</CardTitle>
              <p className="text-xs text-gray-400">This month</p>
            </CardHeader>
            <CardContent>
              <RepPerformanceTable data={repPerformance} currency={company.currency} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed
              activities={recentActivities as any}
              companySlug={params.company}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
