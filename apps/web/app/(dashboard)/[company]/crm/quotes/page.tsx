import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { quotesService } from "@biogrow/crm-core";
import { Button } from "@biogrow/ui/components/button";
import { Badge } from "@biogrow/ui/components/badge";
import { EmptyState } from "@biogrow/ui/feedback/empty-state";
import { formatDate, formatCurrency } from "@biogrow/ui/lib/utils";

const STATUS_VARIANT: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
  DRAFT: "secondary",
  SENT: "primary",
  VIEWED: "warning",
  ACCEPTED: "success",
  REJECTED: "danger",
  EXPIRED: "default",
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  VIEWED: "Viewed",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
};

export default async function QuotesPage({ params }: { params: { company: string } }) {

  const { company, permissions } = await resolveCompany(params.company);
  if (!hasPermission(permissions, Permissions.CRM_QUOTES_VIEW)) {
    redirect(`/${params.company}/dashboard`);
  }

  const { quotes, total } = await quotesService.list({ companyId: company.id, pageSize: 50 });
  const canCreate = hasPermission(permissions, Permissions.CRM_QUOTES_CREATE);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quotes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} quotes</p>
        </div>
        {canCreate && (
          <Link href={`/${params.company}/crm/quotes/new`}>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New Quote
            </Button>
          </Link>
        )}
      </div>

      {quotes.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-7 w-7" />}
          title="No quotes yet"
          description="Create professional quotes linked to your opportunities and accounts."
          action={
            canCreate ? (
              <Link href={`/${params.company}/crm/quotes/new`}>
                <Button size="sm"><Plus className="h-4 w-4" />Create quote</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Number</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Account</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Total</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Valid Until</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {quotes.map((quote) => {
                const isExpired = quote.validUntil && quote.status !== "ACCEPTED"
                  && new Date(quote.validUntil) < new Date();
                return (
                  <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/${params.company}/crm/quotes/${quote.id}`}
                        className="font-medium text-gray-900 hover:text-emerald-600 transition-colors font-mono text-xs"
                      >
                        {quote.number}
                      </Link>
                      {(quote as any).opportunity && (
                        <p className="text-xs text-gray-400 mt-0.5">{(quote as any).opportunity.name}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {(quote as any).account ? (
                        <Link
                          href={`/${params.company}/crm/accounts/${(quote as any).account.id}`}
                          className="hover:text-emerald-600 transition-colors"
                        >
                          {(quote as any).account.name}
                        </Link>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[quote.status] ?? "default"}>
                        {STATUS_LABEL[quote.status] ?? quote.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {formatCurrency(quote.total, quote.currency)}
                    </td>
                    <td className="px-4 py-3">
                      {quote.validUntil ? (
                        <span className={`text-xs ${isExpired ? "text-red-500 font-medium" : "text-gray-500"}`}>
                          {formatDate(quote.validUntil, { month: "short", day: "numeric", year: "numeric" })}
                          {isExpired && " · Expired"}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {formatDate(quote.createdAt, { month: "short", day: "numeric" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
