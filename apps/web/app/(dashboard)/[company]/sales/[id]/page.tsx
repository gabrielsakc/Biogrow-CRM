import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { salesOrdersService } from "@biogrow/erp-core";
import { Badge } from "@biogrow/ui/components/badge";
import { Avatar } from "@biogrow/ui/components/avatar";
import { formatCurrency, formatDate } from "@biogrow/ui/lib/utils";

const STATUS_META: Record<string, { label: string; variant: "default" | "primary" | "secondary" | "success" | "warning" | "danger" }> = {
  DRAFT:      { label: "Draft",      variant: "default"  },
  CONFIRMED:  { label: "Confirmed",  variant: "primary"  },
  PROCESSING: { label: "Processing", variant: "warning"  },
  SHIPPED:    { label: "Shipped",    variant: "primary"  },
  DELIVERED:  { label: "Delivered",  variant: "success"  },
  CANCELLED:  { label: "Cancelled",  variant: "danger"   },
};

export default async function SalesOrderDetailPage({
  params,
}: {
  params: { company: string; id: string };
}) {

  const { company, permissions } = await resolveCompany(params.company);
  if (!hasPermission(permissions, Permissions.ERP_SALES_ORDERS_VIEW)) {
    redirect(`/${params.company}/dashboard`);
  }

  const order = await salesOrdersService.getById(params.id, company.id);
  if (!order) notFound();

  const meta = STATUS_META[order.status];

  return (
    <div className="space-y-5">
      <div>
        <Link
          href={`/${params.company}/sales`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Sales Orders
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-mono">{order.number}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{(order as any).account?.name ?? "—"}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={meta?.variant ?? "default"}>{meta?.label ?? order.status}</Badge>
            <span className="text-xl font-bold text-gray-900">{formatCurrency(order.total, order.currency)}</span>
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
                {(order as any).lineItems?.map((li: any) => (
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
                    <td className="px-4 py-3 text-right text-sm text-gray-700">
                      {li.quantity} {li.product?.unit ?? ""}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700">{formatCurrency(li.unitPrice, order.currency)}</td>
                    <td className="px-5 py-3 text-right text-sm font-medium text-gray-900">{formatCurrency(li.total, order.currency)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-100">
                {order.discountPct > 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-2 text-right text-xs text-gray-400">Discount ({order.discountPct}%)</td>
                    <td className="px-5 py-2 text-right text-sm text-rose-500">−{formatCurrency(order.subtotal * order.discountPct / 100, order.currency)}</td>
                  </tr>
                )}
                {order.taxPct > 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-2 text-right text-xs text-gray-400">Tax ({order.taxPct}%)</td>
                    <td className="px-5 py-2 text-right text-sm text-gray-700">{formatCurrency(order.total - order.subtotal * (1 - order.discountPct / 100), order.currency)}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan={4} className="px-5 py-3 text-right text-sm font-bold text-gray-700 uppercase">Total</td>
                  <td className="px-5 py-3 text-right text-base font-bold text-gray-900">{formatCurrency(order.total, order.currency)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Invoices */}
          {(order as any).invoices?.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700">Invoices</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {(order as any).invoices.map((inv: any) => (
                  <div key={inv.id} className="px-5 py-3 flex items-center justify-between">
                    <Link
                      href={`/${params.company}/finance/invoices/${inv.id}`}
                      className="font-mono text-sm font-semibold text-emerald-600 hover:underline"
                    >
                      {inv.number}
                    </Link>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 font-medium">{inv.status}</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(inv.total, order.currency)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {order.notes && (
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Notes</h2>
              <p className="text-sm text-gray-600 whitespace-pre-line">{order.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">Order Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <Badge variant={meta?.variant ?? "default"}>{meta?.label ?? order.status}</Badge>
              </div>
              {(order as any).account && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer</span>
                  <Link href={`/${params.company}/crm/accounts/${(order as any).account.id}`} className="text-emerald-600 hover:underline text-xs font-medium">
                    {(order as any).account.name}
                  </Link>
                </div>
              )}
              {order.requestedDate && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Requested</span>
                  <span className="text-gray-700">{formatDate(order.requestedDate, { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
              )}
              {(order as any).owner && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Owner</span>
                  <div className="flex items-center gap-1.5">
                    <Avatar src={(order as any).owner.avatarUrl} name={(order as any).owner.name} size="xs" />
                    <span className="text-xs text-gray-700">{(order as any).owner.name}</span>
                  </div>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-700">{formatDate(order.createdAt, { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Summary</h2>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">{formatCurrency(order.subtotal, order.currency)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="font-semibold text-gray-700">Total</span>
                <span className="font-bold text-lg text-gray-900">{formatCurrency(order.total, order.currency)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
