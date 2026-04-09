import { redirect } from "next/navigation";
import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { financeService } from "@biogrow/erp-core";
import { Badge } from "@biogrow/ui/components/badge";
import { EmptyState } from "@biogrow/ui/feedback/empty-state";
import { formatCurrency, formatDate } from "@biogrow/ui/lib/utils";

const STATUS_META: Record<string, { label: string; variant: "default" | "primary" | "secondary" | "success" | "warning" | "danger" }> = {
  ISSUED:         { label: "Issued",          variant: "primary"  },
  SENT:           { label: "Sent",            variant: "primary"  },
  PARTIALLY_PAID: { label: "Partial Payment", variant: "warning"  },
  OVERDUE:        { label: "Overdue",         variant: "danger"   },
};

const AGING_BUCKETS = [
  { key: "current",      label: "Current",   color: "bg-emerald-500", textColor: "text-emerald-700" },
  { key: "overdue30",    label: "1–30 days",  color: "bg-amber-400",   textColor: "text-amber-700"   },
  { key: "overdue60",    label: "31–60 days", color: "bg-orange-500",  textColor: "text-orange-700"  },
  { key: "overdue90plus",label: "+60 days",   color: "bg-rose-500",    textColor: "text-rose-700"    },
] as const;

export default async function ReceivablesPage({ params }: { params: { company: string } }) {

  const { company, permissions } = await resolveCompany(params.company);
  if (!hasPermission(permissions, Permissions.ERP_RECEIVABLES_VIEW)) {
    redirect(`/${params.company}/dashboard`);
  }

  const currency = company.currency ?? "USD";

  const [arSummary, allInvoices] = await Promise.all([
    financeService.getARSummary(company.id),
    financeService.listInvoices({ companyId: company.id, pageSize: 200 }),
  ]);

  const invoices = allInvoices.invoices.filter((inv) =>
    ["ISSUED", "SENT", "PARTIALLY_PAID", "OVERDUE"].includes(inv.status)
  );

  const totalAR =
    arSummary.current.balance +
    arSummary.overdue30.balance +
    arSummary.overdue60.balance +
    arSummary.overdue90plus.balance;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Accounts Receivable</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {invoices.length} open invoices · outstanding: {formatCurrency(totalAR, currency)}
          </p>
        </div>
        <Link href={`/${params.company}/finance/invoices`}>
          <span className="text-sm text-emerald-600 hover:underline font-medium">All invoices →</span>
        </Link>
      </div>

      {/* Aging summary */}
      <div className="grid grid-cols-4 gap-4">
        {AGING_BUCKETS.map(({ key, label, color, textColor }) => {
          const data = arSummary[key];
          return (
            <div key={key} className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${color}`} />
                <span className="text-xs font-medium text-gray-500">{label}</span>
              </div>
              <p className={`text-lg font-bold ${textColor}`}>{formatCurrency(data.balance, currency)}</p>
              <p className="text-xs text-gray-400">{data.count} invoice{data.count !== 1 ? "s" : ""}</p>
            </div>
          );
        })}
      </div>

      {/* Invoice list */}
      {invoices.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="h-7 w-7" />}
          title="No open receivables"
          description="All invoices are paid or no invoices have been issued yet."
        />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Invoice</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Total</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Paid</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Balance</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Due Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Aging</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map((inv) => {
                const meta = STATUS_META[inv.status];
                const balance = inv.total - inv.paidAmount;
                const now = new Date();
                const due = inv.dueDate ? new Date(inv.dueDate) : null;
                const daysOverdue = due && due < now ? Math.floor((now.getTime() - due.getTime()) / 86400000) : 0;

                let agingLabel = "Current";
                let agingClass = "text-emerald-600";
                if (daysOverdue > 60) { agingLabel = `${daysOverdue}d overdue`; agingClass = "text-rose-600 font-semibold"; }
                else if (daysOverdue > 30) { agingLabel = `${daysOverdue}d overdue`; agingClass = "text-orange-600 font-semibold"; }
                else if (daysOverdue > 0) { agingLabel = `${daysOverdue}d overdue`; agingClass = "text-amber-600 font-semibold"; }

                return (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/${params.company}/finance/invoices/${inv.id}`}
                        className="font-mono text-sm font-semibold text-emerald-600 hover:underline"
                      >
                        {inv.number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {(inv as any).account?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={meta?.variant ?? "default"}>{meta?.label ?? inv.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(inv.total, inv.currency)}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-600 font-medium">
                      {inv.paidAmount > 0 ? formatCurrency(inv.paidAmount, inv.currency) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                      {formatCurrency(balance, inv.currency)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {due ? formatDate(due, { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </td>
                    <td className={`px-4 py-3 text-xs ${agingClass}`}>{agingLabel}</td>
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
