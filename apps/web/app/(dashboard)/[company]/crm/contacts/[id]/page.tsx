import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Building2, User, Edit } from "lucide-react";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { contactsService } from "@biogrow/crm-core";
import { Badge } from "@biogrow/ui/components/badge";
import { Button } from "@biogrow/ui/components/button";
import { Avatar } from "@biogrow/ui/components/avatar";
import { formatDate } from "@biogrow/ui/lib/utils";

const ACTIVITY_ICON: Record<string, string> = {
  EMAIL: "📧", CALL: "📞", MEETING: "📅", NOTE: "📝", TASK: "✅", OTHER: "•",
};

export default async function ContactDetailPage({
  params,
}: {
  params: { company: string; id: string };
}) {

  const { company, permissions } = await resolveCompany(params.company);
  if (!hasPermission(permissions, Permissions.CRM_CONTACTS_VIEW)) {
    redirect(`/${params.company}/dashboard`);
  }

  const canEdit = hasPermission(permissions, Permissions.CRM_CONTACTS_EDIT);

  const contact = await contactsService.getById(params.id, company.id);
  if (!contact) notFound();

  return (
    <div className="space-y-5">
      <div>
        <Link
          href={`/${params.company}/crm/contacts`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Contacts
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar
              src={undefined}
              name={`${contact.firstName} ${contact.lastName}`}
              size="lg"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {contact.firstName} {contact.lastName}
              </h1>
              {contact.jobTitle && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {contact.jobTitle}
                  {contact.department ? ` · ${contact.department}` : ""}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {contact.isPrimary && <Badge variant="success">Primary</Badge>}
            {canEdit && (
              <Link href={`/${params.company}/crm/contacts/${params.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Contact Information</h2>
            <div className="grid grid-cols-2 gap-4">
              {contact.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                  <a href={`mailto:${contact.email}`} className="text-sm text-emerald-600 hover:underline">{contact.email}</a>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-700">{contact.phone}</span>
                </div>
              )}
              {(contact as any).account && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
                  <Link
                    href={`/${params.company}/crm/accounts/${(contact as any).account.id}`}
                    className="text-sm text-emerald-600 hover:underline"
                  >
                    {(contact as any).account.name}
                  </Link>
                </div>
              )}
              {(contact as any).owner && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400 shrink-0" />
                  <div className="flex items-center gap-1.5">
                    <Avatar src={(contact as any).owner.avatarUrl} name={(contact as any).owner.name} size="xs" />
                    <span className="text-sm text-gray-700">{(contact as any).owner.name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {(contact as any).activities?.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Activity</h2>
              <div className="space-y-3">
                {(contact as any).activities.map((act: any) => (
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

        <div className="space-y-5">
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">Details</h2>
            <div className="space-y-2 text-sm">
              {contact.department && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Department</span>
                  <span className="text-gray-900">{contact.department}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Primary</span>
                <span className="text-gray-900">{contact.isPrimary ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-700">{formatDate(contact.createdAt, { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
            </div>
          </div>

          {(contact as any).tasks?.filter((t: any) => t.status !== "COMPLETED").length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Open Tasks</h2>
              <div className="space-y-2">
                {(contact as any).tasks
                  .filter((t: any) => t.status !== "COMPLETED")
                  .map((task: any) => (
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
