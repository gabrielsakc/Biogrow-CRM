import { redirect } from "next/navigation";
import { db } from "@biogrow/database";
import { DashboardCards } from "@/components/dashboard-cards";
import { PipelineChart } from "@/components/pipeline-chart";
import { RecentActivities } from "@/components/recent-activities";

export default async function DashboardPage({
  params,
}: {
  params: { company: string };
}) {

  // TODO: Get company stats
  const company = await db.company.findUnique({
    where: { slug: params.company },
  });

  if (!company) {
    redirect("/select-company");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to {company.name}</p>
      </div>

      <DashboardCards companyId={company.id} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PipelineChart companyId={company.id} />
        <RecentActivities companyId={company.id} />
      </div>
    </div>
  );
}