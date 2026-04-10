import { redirect } from "next/navigation";
import { Activity } from "lucide-react";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { activitiesService } from "@biogrow/crm-core";
import { Card, CardContent, CardHeader, CardTitle } from "@biogrow/ui/components/card";
import { EmptyState } from "@biogrow/ui/feedback/empty-state";
import { ActivityFeed } from "@/components/crm/activity-feed";
import { ActivitiesClient } from "@/components/crm/activities-client";

export default async function ActivitiesPage({ params }: { params: { company: string } }) {

  const { company, permissions } = await resolveCompany(params.company);
  if (!hasPermission(permissions, Permissions.CRM_ACTIVITIES_VIEW)) {
    redirect(`/${params.company}/dashboard`);
  }

  const canCreate = hasPermission(permissions, Permissions.CRM_ACTIVITIES_CREATE);
  const activities = await activitiesService.listRecent(company.id, 50);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Activities</h1>
          <p className="text-sm text-gray-500 mt-0.5">{activities.length} recent activities</p>
        </div>
        <ActivitiesClient
          companyId={company.id}
          companySlug={params.company}
          canCreate={canCreate}
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <EmptyState
              icon={<Activity className="h-7 w-7" />}
              title="No activities"
              description="Activities will appear here when you log calls, emails, meetings or notes."
            />
          ) : (
            <ActivityFeed activities={activities as any} companySlug={params.company} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
