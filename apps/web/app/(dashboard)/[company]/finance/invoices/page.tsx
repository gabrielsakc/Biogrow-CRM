import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { financeService } from "@biogrow/erp-core";
import { Button } from "@biogrow/ui/components/button";
import { Badge } from "@biogrow/ui/components/badge";
import { EmptyState } from "@biogrow/ui/feedback/empty-state";
import { Avatar } from "@biogrow/ui/components/avatar";
import { formatCurrency, formatDate } from "@biogrow/ui/lib/utils";

const STATUS_META: Record<string, { label: string; variant: "default" | "primary" | "secondary" | "success" | "warning" | "danger" }> = {
  DRAFT:           { label: "Draft",           variant: "default"  },
  ISSUED:          { label: "Issued",           variant: "primary"  },
  SENT:            { label: "Sent",             variant: "primary"  },
  PARTIALLY_PAID:  { label: "Partial Payment", variant: "warning"  },
  PAID:            { label: "Paid",             variant: "success"  },
  OVERDUE:         { label: "Overdue",          variant: "danger"   },
  VOID:            { label: "Void",             variant: "default"  },
};

export default async function InvoicesPage({ params }: { params: { company: string } }) {

  const { company, permissions } = await resolveCompany(params.company);
  if (!hasPermission(permissions, Permissions.ERP_INVOICES_VIEW)) {
    redirect(`/${params.company}/dashboard`);
  }

  const { invoices, total } = await financeService.listInvoices({ companyId: company.id, pageSize: 50 });
  const canCreate = hasPermission(permissions, Permissions.ERP_INVOICES_CREATE);

  const totalPending = invoices
    .filter((inv) => ["ISSUED", "SENT", "PARTIALLY_PAID", "OVERDUE"].includes(inv.status))
    .reduce((s, inv) => s + (inv.total - inv.paidAmount), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} invoices · outstanding: {formatCurrency(totalPending, company.currency ?? "USD")}
          </p>
        </div>
        {canCreate && (
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New Invoice
          </Button>
        )}
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-7 w-7" />}
          title="No invoices issued"
          description="Create invoices from sales orders or manually."
          action={canCreate ? <Button size="sm"><Plus className="h-4 w-4" />New Invoice</Button> : undefined}
        />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Number</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Total</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Paid</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Balance</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map((inv) => {
                const meta = STATUS_META[inv.status];
                const balance = inv.total - inv.paidAmount;
                const isOverdue = inv.dueDate && inv.dueDate < new Date() && !["PAID","VOID"].includes(inv.status);
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
                      {balance > 0 ? formatCurrency(balance, inv.currency) : "—"}
                    </td>
                    <td className={`px-4 py-3 text-xs ${isOverdue ? "text-rose-600 font-semibold" : "text-gray-500"}`}>
                      {inv.dueDate
                        ? formatDate(inv.dueDate, { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
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
