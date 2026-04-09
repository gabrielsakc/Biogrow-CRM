import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { financeService } from "@biogrow/erp-core";
import { Badge } from "@biogrow/ui/components/badge";
import { Avatar } from "@biogrow/ui/components/avatar";
import { formatCurrency, formatDate } from "@biogrow/ui/lib/utils";

const STATUS_META: Record<string, { label: string; variant: "default" | "primary" | "secondary" | "success" | "warning" | "danger" }> = {
  DRAFT:          { label: "Draft",           variant: "default"  },
  ISSUED:         { label: "Issued",           variant: "primary"  },
  SENT:           { label: "Sent",             variant: "primary"  },
  PARTIALLY_PAID: { label: "Partial Payment",  variant: "warning"  },
  PAID:           { label: "Paid",             variant: "success"  },
  OVERDUE:        { label: "Overdue",          variant: "danger"   },
  VOID:           { label: "Void",             variant: "default"  },
};

export default async function InvoiceDetailPage({
  params,
}: {
  params: { company: string; id: string };
}) {

  const { company, permissions } = await resolveCompany(params.company);
  if (!hasPermission(permissions, Permissions.ERP_INVOICES_VIEW)) {
    redirect(`/${params.company}/dashboard`);
  }

  const invoice = await financeService.getInvoiceById(params.id, company.id);
  if (!invoice) notFound();

  const meta = STATUS_META[invoice.status];
  const balance = invoice.total - invoice.paidAmount;
  const isOverdue = invoice.dueDate && invoice.dueDate < new Date() && !["PAID", "VOID"].includes(invoice.status);

  return (
    <div className="space-y-5">
      <div>
        <Link
          href={`/${params.company}/finance/invoices`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Invoices
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-mono">{invoice.number}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {(invoice as any).account?.name ?? "—"}
              {(invoice as any).salesOrder && ` · SO ${(invoice as any).salesOrder.number}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={meta?.variant ?? "default"}>{meta?.label ?? invoice.status}</Badge>
            {isOverdue && <Badge variant="danger">Overdue</Badge>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          {/* Line items */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">Line Items</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                  <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(invoice as any).lineItems?.map((li: any) => (
                  <tr key={li.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm text-gray-800">{li.description}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {li.product ? (
                        <Link href={`/${params.company}/inventory/products/${li.product.id}`} className="hover:text-emerald-600">
                          {li.product.name}
                          {li.product.sku && <span className="ml-1 font-mono text-gray-400">{li.product.sku}</span>}
                        </Link>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700">{li.quantity}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700">{formatCurrency(li.unitPrice, invoice.currency)}</td>
                    <td className="px-5 py-3 text-right text-sm font-medium text-gray-900">{formatCurrency(li.total, invoice.currency)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-100">
                {invoice.taxPct > 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-2 text-right text-xs text-gray-400">Tax ({invoice.taxPct}%)</td>
                    <td className="px-5 py-2 text-right text-sm text-gray-700">{formatCurrency(invoice.total - invoice.subtotal, invoice.currency)}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan={4} className="px-5 py-3 text-right text-sm font-bold text-gray-700 uppercase">Total</td>
                  <td className="px-5 py-3 text-right text-base font-bold text-gray-900">{formatCurrency(invoice.total, invoice.currency)}</td>
                </tr>
                {invoice.paidAmount > 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-2 text-right text-xs text-gray-400">Paid</td>
                    <td className="px-5 py-2 text-right text-sm text-emerald-600 font-medium">−{formatCurrency(invoice.paidAmount, invoice.currency)}</td>
                  </tr>
                )}
                {balance > 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-3 text-right text-sm font-bold text-gray-700 uppercase">Balance Due</td>
                    <td className="px-5 py-3 text-right text-base font-bold text-rose-600">{formatCurrency(balance, invoice.currency)}</td>
                  </tr>
                )}
              </tfoot>
            </table>
          </div>

          {/* AR Ledger entries */}
          {(invoice as any).arLedger?.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700">Payment History</h2>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-2 text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="text-right px-5 py-2 text-xs font-medium text-gray-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(invoice as any).arLedger.map((entry: any) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-5 py-2.5 text-sm text-gray-700">{formatDate(entry.entryDate, { month: "short", day: "numeric", year: "numeric" })}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-600">{entry.type}</td>
                      <td className={`px-5 py-2.5 text-right text-sm font-medium ${entry.amount >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {formatCurrency(entry.amount, invoice.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {invoice.notes && (
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Notes</h2>
              <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">Invoice Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <Badge variant={meta?.variant ?? "default"}>{meta?.label ?? invoice.status}</Badge>
              </div>
              {(invoice as any).account && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer</span>
                  <Link href={`/${params.company}/crm/accounts/${(invoice as any).account.id}`} className="text-emerald-600 hover:underline text-xs font-medium">
                    {(invoice as any).account.name}
                  </Link>
                </div>
              )}
              {(invoice as any).salesOrder && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Sales Order</span>
                  <Link href={`/${params.company}/sales/${(invoice as any).salesOrder.id}`} className="text-emerald-600 hover:underline text-xs font-mono font-medium">
                    {(invoice as any).salesOrder.number}
                  </Link>
                </div>
              )}
              {invoice.issuedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Issued</span>
                  <span className="text-gray-700">{formatDate(invoice.issuedAt, { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
              )}
              {invoice.dueDate && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Due Date</span>
                  <span className={`font-medium ${isOverdue ? "text-rose-600" : "text-gray-700"}`}>
                    {formatDate(invoice.dueDate, { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              )}
              {(invoice as any).owner && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Owner</span>
                  <div className="flex items-center gap-1.5">
                    <Avatar src={(invoice as any).owner.avatarUrl} name={(invoice as any).owner.name} size="xs" />
                    <span className="text-xs text-gray-700">{(invoice as any).owner.name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Payment Summary</h2>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Invoice Total</span>
                <span className="font-medium text-gray-900">{formatCurrency(invoice.total, invoice.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Paid</span>
                <span className="font-medium text-emerald-600">{formatCurrency(invoice.paidAmount, invoice.currency)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="font-semibold text-gray-700">Balance Due</span>
                <span className={`font-bold text-base ${balance > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                  {formatCurrency(balance, invoice.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
