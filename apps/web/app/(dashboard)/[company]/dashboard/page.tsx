import { redirect } from "next/navigation";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import {
  dashboardService,
  activitiesService,
  pipelineService,
} from "@biogrow/crm-core";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export async function generateMetadata({
  params,
}: {
  params: { company: string };
}) {
  return { title: `Dashboard — ${params.company}` };
}

export default async function DashboardPage({
  params,
}: {
  params: { company: string };
}) {
  const { company, permissions } = await resolveCompany(params.company);

  if (!company) {
    redirect("/select-company");
  }

  const canViewCRM = hasPermission(permissions, Permissions.CRM_PIPELINE_VIEW);
  const canCreateLead = hasPermission(permissions, Permissions.CRM_LEADS_CREATE);
  const canCreateOpp = hasPermission(permissions, Permissions.CRM_OPPORTUNITIES_CREATE);
  const canCreateTask = hasPermission(permissions, Permissions.CRM_ACTIVITIES_CREATE);

  const [kpis, pipeline, recentActivities, stages] = await Promise.all([
    canViewCRM
      ? dashboardService.getKPIs(company.id)
      : Promise.resolve(null),
    canViewCRM
      ? dashboardService.getPipelineByStage(company.id)
      : Promise.resolve([]),
    canViewCRM
      ? activitiesService.listRecent(company.id, 8)
      : Promise.resolve([]),
    canCreateOpp
      ? pipelineService.getStages(company.id)
      : Promise.resolve([]),
  ]);

  return (
    <DashboardClient
      company={{ id: company.id, name: company.name, slug: company.slug }}
      kpis={kpis}
      pipeline={pipeline as any[]}
      recentActivities={recentActivities as any[]}
      stages={stages as any[]}
      permissions={{ canCreateLead, canCreateOpp, canCreateTask }}
    />
  );
}
