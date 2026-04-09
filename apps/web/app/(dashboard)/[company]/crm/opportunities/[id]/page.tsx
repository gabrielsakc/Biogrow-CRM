import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Target, FileText, User } from "lucide-react";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { opportunitiesService } from "@biogrow/crm-core";
import { Badge } from "@biogrow/ui/components/badge";
import { Avatar } from "@biogrow/ui/components/avatar";
import { formatCurrency, formatDate } from "@biogrow/ui/lib/utils";

const FORECAST_META: Record<string, { label: string; variant: "default" | "primary" | "secondary" | "success" | "warning" | "danger" }> = {
  PIPELINE:    { label: "Pipeline",   variant: "secondary" },
  BEST_CASE:   { label: "Best Case",  variant: "warning"   },
  COMMIT:      { label: "Commit",     variant: "primary"   },
  CLOSED_WON:  { label: "Won",        variant: "success"   },
  CLOSED_LOST: { label: "Lost",       variant: "danger"    },
  OMITTED:     { label: "Omitted",    variant: "default"   },
};

const ACTIVITY_ICON: Record<string, string> = {
  EMAIL: "📧", CALL: "📞", MEETING: "📅", NOTE: "📝", TASK: "✅", OTHER: "•",
};

const STATUS_VARIANT: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
  DRAFT: "secondary", SENT: "primary", VIEWED: "warning", ACCEPTED: "success", REJECTED: "danger", EXPIRED: "default",
};

export default async function OpportunityDetailPage({
  params,
}: {
  params: { company: string; id: string };
}) {

  const { company, permissions } = await resolveCompany(params.company);
  if (!hasPermission(permissions, Permissions.CRM_OPPORTUNITIES_VIEW)) {
    redirect(`/${params.company}/dashboard`);
  }

  const opp = await opportunitiesService.getById(params.id, company.id);
  if (!opp) notFound();

  const forecastMeta = FORECAST_META[(opp as any).forecastCategory ?? "PIPELINE"];

  return (
    <div className="space-y-5">
      <div>
        <Link
          href={`/${params.company}/crm/opportunities`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Opportunities
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{opp.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {(opp as any).account?.name ?? "—"} · {(opp as any).stage?.name ?? "—"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-emerald-600">{formatCurrency(opp.amount, opp.currency)}</span>
            <Badge variant={forecastMeta?.variant ?? "default"}>{forecastMeta?.label ?? (opp as any).forecastCategory}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          {/* Details */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Opportunity Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {(opp as any).account && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Account</p>
                  <Link href={`/${params.company}/crm/accounts/${(opp as any).account.id}`} className="text-emerald-600 hover:underline font-medium">
                    {(opp as any).account.name}
                  </Link>
                </div>
              )}
              {(opp as any).contact && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Primary Contact</p>
                  <Link href={`/${params.company}/crm/contacts/${(opp as any).contact.id}`} className="text-emerald-600 hover:underline font-medium">
                    {(opp as any).contact.firstName} {(opp as any).contact.lastName}
                  </Link>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Stage</p>
                <span className="font-medium text-gray-900">{(opp as any).stage?.name ?? "—"}</span>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Probability</p>
                <span className="font-medium text-gray-900">{opp.probability ?? 0}%</span>
              </div>
              {opp.expectedCloseDate && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Expected Close</p>
                  <span className="font-medium text-gray-900">{formatDate(opp.expectedCloseDate, { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
              )}
              {(opp as any).owner && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Owner</p>
                  <div className="flex items-center gap-1.5">
                    <Avatar src={(opp as any).owner.avatarUrl} name={(opp as any).owner.name} size="xs" />
                    <span className="font-medium text-gray-900">{(opp as any).owner.name}</span>
                  </div>
                </div>
              )}
            </div>
            {opp.description && (
              <p className="mt-4 text-sm text-gray-500 border-t border-gray-100 pt-4">{opp.description}</p>
            )}
            {opp.nextStep && (
              <div className="mt-3 rounded-lg bg-amber-50 border border-amber-100 px-4 py-2.5">
                <p className="text-xs font-medium text-amber-700 mb-0.5">Next Step</p>
                <p className="text-sm text-amber-900">{opp.nextStep}</p>
              </div>
            )}
          </div>

          {/* Quotes */}
          {(opp as any).quotes?.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700">Quotes</h2>
                {hasPermission(permissions, Permissions.CRM_QUOTES_CREATE) && (
                  <Link
                    href={`/${params.company}/crm/quotes/new?opportunityId=${opp.id}`}
                    className="text-xs text-emerald-600 hover:underline font-medium"
                  >
                    + New Quote
                  </Link>
                )}
              </div>
              <div className="divide-y divide-gray-50">
                {(opp as any).quotes.map((quote: any) => (
                  <div key={quote.id} className="px-5 py-3 flex items-center justify-between">
                    <Link
                      href={`/${params.company}/crm/quotes/${quote.id}`}
                      className="font-mono text-sm font-semibold text-emerald-600 hover:underline"
                    >
                      {quote.number}
                    </Link>
                    <div className="flex items-center gap-3">
                      <Badge variant={STATUS_VARIANT[quote.status] ?? "default"}>{quote.status}</Badge>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(quote.total, quote.currency)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activities */}
          {(opp as any).activities?.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Activity</h2>
              <div className="space-y-3">
                {(opp as any).activities.map((act: any) => (
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
            <h2 className="text-sm font-semibold text-gray-700">KPIs</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold text-gray-900">{formatCurrency(opp.amount, opp.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Weighted</span>
                <span className="font-medium text-gray-700">
                  {formatCurrency(opp.amount * ((opp.probability ?? 0) / 100), opp.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Forecast</span>
                <Badge variant={forecastMeta?.variant ?? "default"}>{forecastMeta?.label}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-700">{formatDate(opp.createdAt, { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
            </div>
          </div>

          {(opp as any).tasks?.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Open Tasks</h2>
              <div className="space-y-2">
                {(opp as any).tasks.map((task: any) => (
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
