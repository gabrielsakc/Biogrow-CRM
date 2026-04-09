import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Globe, Phone, Mail, User, Plus } from "lucide-react";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { accountsService } from "@biogrow/crm-core";
import { Badge } from "@biogrow/ui/components/badge";
import { Avatar } from "@biogrow/ui/components/avatar";
import { formatCurrency, formatDate } from "@biogrow/ui/lib/utils";

const TYPE_META: Record<string, { label: string; variant: "default" | "primary" | "secondary" | "success" | "warning" | "danger" }> = {
  PROSPECT: { label: "Prospect", variant: "secondary" },
  CUSTOMER: { label: "Customer", variant: "success"   },
  PARTNER:  { label: "Partner",  variant: "primary"   },
  VENDOR:   { label: "Vendor",   variant: "default"   },
  CHURNED:  { label: "Churned",  variant: "danger"    },
};

const ACTIVITY_ICON: Record<string, string> = {
  EMAIL: "📧", CALL: "📞", MEETING: "📅", NOTE: "📝", TASK: "✅", OTHER: "•",
};

export default async function AccountDetailPage({
  params,
}: {
  params: { company: string; id: string };
}) {

  const { company, permissions } = await resolveCompany(params.company);
  if (!hasPermission(permissions, Permissions.CRM_ACCOUNTS_VIEW)) {
    redirect(`/${params.company}/dashboard`);
  }

  const account = await accountsService.getById(params.id, company.id);
  if (!account) notFound();

  const typeMeta = TYPE_META[account.type];

  return (
    <div className="space-y-5">
      {/* Back + header */}
      <div>
        <Link
          href={`/${params.company}/crm/accounts`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Accounts
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{account.name}</h1>
            {account.industry && <p className="text-sm text-gray-500 mt-0.5">{account.industry}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={typeMeta?.variant ?? "default"}>{typeMeta?.label ?? account.type}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Left */}
        <div className="col-span-2 space-y-5">
          {/* Info */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Account Information</h2>
            <div className="grid grid-cols-2 gap-4">
              {account.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-700">{account.phone}</span>
                </div>
              )}
              {account.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                  <a href={`mailto:${account.email}`} className="text-sm text-emerald-600 hover:underline">{account.email}</a>
                </div>
              )}
              {account.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-400 shrink-0" />
                  <a href={account.website} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-600 hover:underline truncate">{account.website}</a>
                </div>
              )}
              {(account as any).owner && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400 shrink-0" />
                  <div className="flex items-center gap-1.5">
                    <Avatar src={(account as any).owner.avatarUrl} name={(account as any).owner.name} size="xs" />
                    <span className="text-sm text-gray-700">{(account as any).owner.name}</span>
                  </div>
                </div>
              )}
            </div>
            {account.description && (
              <p className="mt-4 text-sm text-gray-500 border-t border-gray-100 pt-4">{account.description}</p>
            )}
          </div>

          {/* Contacts */}
          {(account as any).contacts?.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700">Contacts ({(account as any)._count?.contacts ?? 0})</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {(account as any).contacts.map((contact: any) => (
                  <div key={contact.id} className="px-5 py-3 flex items-center gap-3">
                    <Avatar src={contact.owner?.avatarUrl} name={`${contact.firstName} ${contact.lastName}`} size="sm" />
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/${params.company}/crm/contacts/${contact.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-emerald-600 transition-colors"
                      >
                        {contact.firstName} {contact.lastName}
                        {contact.isPrimary && <span className="ml-1.5 text-xs text-emerald-600">(Primary)</span>}
                      </Link>
                      {contact.jobTitle && <p className="text-xs text-gray-400">{contact.jobTitle}</p>}
                    </div>
                    {contact.email && (
                      <a href={`mailto:${contact.email}`} className="text-xs text-gray-400 hover:text-emerald-600">
                        {contact.email}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Opportunities */}
          {(account as any).opportunities?.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700">Opportunities ({(account as any)._count?.opportunities ?? 0})</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {(account as any).opportunities.map((opp: any) => (
                  <div key={opp.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <Link
                        href={`/${params.company}/crm/opportunities/${opp.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-emerald-600"
                      >
                        {opp.name}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">{opp.stage?.name ?? "—"}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(opp.amount, opp.currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity feed */}
          {(account as any).activities?.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {(account as any).activities.map((act: any) => (
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

        {/* Right */}
        <div className="space-y-5">
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <Badge variant={typeMeta?.variant ?? "default"}>{typeMeta?.label ?? account.type}</Badge>
              </div>
              {account.annualRevenue != null && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Annual Revenue</span>
                  <span className="text-gray-900 font-medium">{formatCurrency(account.annualRevenue, "USD")}</span>
                </div>
              )}
              {account.employeeCount != null && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Employees</span>
                  <span className="text-gray-900">{account.employeeCount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-700">{formatDate(account.createdAt, { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
            </div>
          </div>

          {(account as any).tasks?.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Open Tasks</h2>
              <div className="space-y-2">
                {(account as any).tasks.map((task: any) => (
                  <div key={task.id} className="text-sm">
                    <p className="text-gray-800 font-medium">{task.title}</p>
                    {task.dueDate && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Due {formatDate(task.dueDate, { month: "short", day: "numeric" })}
                        {task.assignee && ` · ${task.assignee.name}`}
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
