import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Building2, User, Edit, ArrowRight } from "lucide-react";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { leadsService } from "@biogrow/crm-core";
import { Badge } from "@biogrow/ui/components/badge";
import { Button } from "@biogrow/ui/components/button";
import { Avatar } from "@biogrow/ui/components/avatar";
import { formatDate } from "@biogrow/ui/lib/utils";

const STATUS_META: Record<string, { label: string; variant: "default" | "primary" | "secondary" | "success" | "warning" | "danger" }> = {
  NEW:         { label: "New",         variant: "primary"   },
  CONTACTED:   { label: "Contacted",   variant: "warning"   },
  QUALIFIED:   { label: "Qualified",   variant: "success"   },
  UNQUALIFIED: { label: "Unqualified", variant: "default"   },
  CONVERTED:   { label: "Converted",   variant: "secondary" },
};

const ACTIVITY_ICON: Record<string, string> = {
  EMAIL: "📧", CALL: "📞", MEETING: "📅", NOTE: "📝", TASK: "✅", OTHER: "•",
};

export default async function LeadDetailPage({
  params,
}: {
  params: { company: string; id: string };
}) {

  const { company, permissions } = await resolveCompany(params.company);
  if (!hasPermission(permissions, Permissions.CRM_LEADS_VIEW)) {
    redirect(`/${params.company}/dashboard`);
  }

  const canEdit = hasPermission(permissions, Permissions.CRM_LEADS_EDIT);
  const canConvert = hasPermission(permissions, Permissions.CRM_LEADS_CONVERT);

  const lead = await leadsService.getById(params.id, company.id);
  if (!lead) notFound();

  const meta = STATUS_META[lead.status];
  const isConverted = lead.status === "CONVERTED";

  return (
    <div className="space-y-5">
      {/* Back + header */}
      <div>
        <Link
          href={`/${params.company}/crm/leads`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Leads
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {lead.firstName} {lead.lastName}
            </h1>
            {lead.jobTitle && (
              <p className="text-sm text-gray-500 mt-0.5">
                {lead.jobTitle}{lead.companyName ? ` · ${lead.companyName}` : ""}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={meta?.variant ?? "default"}>{meta?.label ?? lead.status}</Badge>
            {canEdit && !isConverted && (
              <Link href={`/${params.company}/crm/leads/${params.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </Link>
            )}
            {canConvert && !isConverted && (
              <Link href={`/${params.company}/crm/leads/${params.id}/convert`}>
                <Button size="sm">
                  <ArrowRight className="h-4 w-4 mr-1" />
                  Convert
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Left: details */}
        <div className="col-span-2 space-y-5">
          {/* Contact info */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Contact Information</h2>
            <div className="grid grid-cols-2 gap-4">
              {lead.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                  <a href={`mailto:${lead.email}`} className="text-sm text-emerald-600 hover:underline">{lead.email}</a>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-700">{lead.phone}</span>
                </div>
              )}
              {lead.companyName && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-700">{lead.companyName}</span>
                </div>
              )}
              {(lead as any).owner && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400 shrink-0" />
                  <div className="flex items-center gap-1.5">
                    <Avatar src={(lead as any).owner.avatarUrl} name={(lead as any).owner.name} size="xs" />
                    <span className="text-sm text-gray-700">{(lead as any).owner.name}</span>
                  </div>
                </div>
              )}
            </div>
            {lead.description && (
              <p className="mt-4 text-sm text-gray-500 border-t border-gray-100 pt-4">{lead.description}</p>
            )}
          </div>

          {/* Activity feed */}
          {(lead as any).activities?.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Activity</h2>
              <div className="space-y-3">
                {(lead as any).activities.map((act: any) => (
                  <div key={act.id} className="flex gap-3">
                    <span className="text-base shrink-0 mt-0.5">{ACTIVITY_ICON[act.type] ?? "•"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">{act.subject}</p>
                      {act.notes && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{act.notes}</p>}
                      <p className="text-xs text-gray-400 mt-1">
                        {act.user?.name} · {formatDate(act.occurredAt, { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: meta + tasks */}
        <div className="space-y-5">
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Source</span>
                <span className="text-gray-900 font-medium">{lead.source ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <Badge variant={meta?.variant ?? "default"} className="text-xs">{meta?.label ?? lead.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-700">{formatDate(lead.createdAt, { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
            </div>
          </div>

          {(lead as any).tasks?.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Open Tasks</h2>
              <div className="space-y-2">
                {(lead as any).tasks.filter((t: any) => t.status !== "COMPLETED").map((task: any) => (
                  <div key={task.id} className="text-sm">
                    <p className="text-gray-800 font-medium">{task.title}</p>
                    {task.dueDate && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Due {formatDate(task.dueDate, { month: "short", day: "numeric" })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
