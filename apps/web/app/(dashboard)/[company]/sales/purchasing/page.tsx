import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Truck } from "lucide-react";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { purchaseOrdersService } from "@biogrow/erp-core";
import { Button } from "@biogrow/ui/components/button";
import { Badge } from "@biogrow/ui/components/badge";
import { EmptyState } from "@biogrow/ui/feedback/empty-state";
import { Avatar } from "@biogrow/ui/components/avatar";
import { formatCurrency, formatDate } from "@biogrow/ui/lib/utils";

const STATUS_META: Record<string, { label: string; variant: "default" | "primary" | "secondary" | "success" | "warning" | "danger" }> = {
  DRAFT:               { label: "Draft",             variant: "default"  },
  SUBMITTED:           { label: "Submitted",          variant: "warning"  },
  APPROVED:            { label: "Approved",           variant: "primary"  },
  PARTIALLY_RECEIVED:  { label: "Partial Receipt",    variant: "warning"  },
  RECEIVED:            { label: "Received",           variant: "success"  },
  CANCELLED:           { label: "Cancelled",          variant: "danger"   },
};

export default async function PurchasingPage({ params }: { params: { company: string } }) {

  const { company, permissions } = await resolveCompany(params.company);
  if (!hasPermission(permissions, Permissions.ERP_PURCHASE_ORDERS_VIEW)) {
    redirect(`/${params.company}/dashboard`);
  }

  const [{ orders, total }, stats] = await Promise.all([
    purchaseOrdersService.list({ companyId: company.id, pageSize: 50 }),
    purchaseOrdersService.getStats(company.id),
  ]);

  const canCreate = hasPermission(permissions, Permissions.ERP_PURCHASE_ORDERS_CREATE);
  const pendingApproval = stats.find((s) => s.status === "SUBMITTED")?.count ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/${params.company}/sales`}>
            <Button variant="outline" size="sm">Sales Orders</Button>
          </Link>
          {canCreate && (
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New PO
            </Button>
          )}
        </div>
      </div>

      {pendingApproval > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
          <strong>{pendingApproval}</strong> order{pendingApproval > 1 ? "s" : ""} pending approval
        </div>
      )}

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-4">
        {["SUBMITTED", "APPROVED", "RECEIVED"].map((s) => {
          const row = stats.find((r) => r.status === s);
          const meta = STATUS_META[s];
          return (
            <div key={s} className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-medium text-gray-500">{meta.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{row?.count ?? 0}</p>
              <p className="text-xs text-gray-400 mt-1">
                {formatCurrency(row?.totalAmount ?? 0, company.currency ?? "USD")}
              </p>
            </div>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={<Truck className="h-7 w-7" />}
          title="No purchase orders"
          description="Create purchase orders for your vendors."
          action={canCreate ? <Button size="sm"><Plus className="h-4 w-4" />New PO</Button> : undefined}
        />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Number</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Vendor</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Total</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Expected Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Created by</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => {
                const meta = STATUS_META[order.status];
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/${params.company}/sales/purchasing/${order.id}`}
                        className="font-mono text-sm font-semibold text-emerald-600 hover:underline"
                      >
                        {order.number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {(order as any).vendor?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={meta?.variant ?? "default"}>{meta?.label ?? order.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(order.total, order.currency)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {order.expectedDate
                        ? formatDate(order.expectedDate, { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar src={(order as any).owner?.avatarUrl} name={(order as any).owner?.name ?? "?"} size="xs" />
                        <span className="text-xs text-gray-500">{(order as any).owner?.name}</span>
                      </div>
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
