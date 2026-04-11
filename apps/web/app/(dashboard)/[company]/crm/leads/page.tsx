import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { leadsService } from "@biogrow/crm-core";
import { Button } from "@biogrow/ui/components/button";
import { Badge } from "@biogrow/ui/components/badge";
import { EmptyState } from "@biogrow/ui/feedback/empty-state";
import { Avatar } from "@biogrow/ui/components/avatar";
import { formatDate } from "@biogrow/ui/lib/utils";

const STATUS_VARIANT: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
  NEW: "secondary",
  CONTACTED: "warning",
  QUALIFIED: "primary",
  UNQUALIFIED: "danger",
  CONVERTED: "success",
};

const STATUS_LABEL: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  UNQUALIFIED: "Unqualified",
  CONVERTED: "Converted",
};

const SOURCE_LABEL: Record<string, string> = {
  WEBSITE: "Website",
  REFERRAL: "Referral",
  COLD_OUTREACH: "Outreach",
  EVENT: "Event",
  SOCIAL_MEDIA: "Social",
  PAID_ADS: "Paid Ads",
  EMAIL_CAMPAIGN: "Email",
  PARTNER: "Partner",
  OTHER: "Other",
};

export default async function LeadsPage({ params }: { params: { company: string } }) {

  const { company, permissions } = await resolveCompany(params.company);
  if (!hasPermission(permissions, Permissions.CRM_LEADS_VIEW)) {
    redirect(`/${params.company}/dashboard`);
  }

  const { leads, total } = await leadsService.list({ companyId: company.id, pageSize: 50 });
  const canCreate = hasPermission(permissions, Permissions.CRM_LEADS_CREATE);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} leads total</p>
        </div>
        {canCreate && (
          <Link href={`/${params.company}/crm/leads/new`}>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New Lead
            </Button>
          </Link>
        )}
      </div>

      {/* Table */}
      {leads.length === 0 ? (
        <EmptyState
          icon={<Users className="h-7 w-7" />}
          title="No leads yet"
          description="Capture your first lead to start building the sales pipeline."
          action={
            canCreate ? (
              <Link href={`/${params.company}/crm/leads/new`}>
                <Button size="sm">
                  <Plus className="h-4 w-4" />
                  Create first lead
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Company</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Source</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Owner</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/${params.company}/crm/leads/${lead.id}`}
                      className="font-medium text-gray-900 hover:text-emerald-600 transition-colors"
                    >
                      {lead.firstName} {lead.lastName}
                    </Link>
                    {lead.email && (
                      <p className="text-xs text-gray-400 mt-0.5">{lead.email}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{lead.companyName ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {SOURCE_LABEL[lead.source] ?? lead.source}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[lead.status] ?? "default"}>
                      {STATUS_LABEL[lead.status] ?? lead.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar src={(lead as any).owner?.avatarUrl} name={(lead as any).owner?.name ?? "?"} size="xs" />
                      <span className="text-gray-600 text-xs">{(lead as any).owner?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {formatDate(lead.createdAt, { month: "short", day: "numeric" })}
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
