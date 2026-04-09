import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, ShoppingCart } from "lucide-react";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { salesOrdersService } from "@biogrow/erp-core";
import { Button } from "@biogrow/ui/components/button";
import { Badge } from "@biogrow/ui/components/badge";
import { EmptyState } from "@biogrow/ui/feedback/empty-state";
import { Avatar } from "@biogrow/ui/components/avatar";
import { formatCurrency, formatDate } from "@biogrow/ui/lib/utils";

const STATUS_META: Record<string, { label: string; variant: "default" | "primary" | "secondary" | "success" | "warning" | "danger" }> = {
  DRAFT:       { label: "Draft",       variant: "default"   },
  CONFIRMED:   { label: "Confirmed",   variant: "primary"   },
  PROCESSING:  { label: "Processing",  variant: "warning"   },
  SHIPPED:     { label: "Shipped",     variant: "primary"   },
  DELIVERED:   { label: "Delivered",   variant: "success"   },
  CANCELLED:   { label: "Cancelled",   variant: "danger"    },
};

export default async function SalesOrdersPage({ params }: { params: { company: string } }) {

  const { company, permissions } = await resolveCompany(params.company);
  if (!hasPermission(permissions, Permissions.ERP_SALES_ORDERS_VIEW)) {
    redirect(`/${params.company}/dashboard`);
  }

  const [{ orders, total }, stats] = await Promise.all([
    salesOrdersService.list({ companyId: company.id, pageSize: 50 }),
    salesOrdersService.getStats(company.id),
  ]);

  const canCreate = hasPermission(permissions, Permissions.ERP_SALES_ORDERS_CREATE);
  const openAmount = stats
    .filter((s) => !["DELIVERED", "CANCELLED"].includes(s.status))
    .reduce((sum, s) => sum + s.totalAmount, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sales Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/${params.company}/sales/purchasing`}>
            <Button variant="outline" size="sm">Purchase Orders</Button>
          </Link>
          {canCreate && (
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New Order
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Open orders</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {stats.filter((s) => ["CONFIRMED", "PROCESSING", "SHIPPED"].includes(s.status)).reduce((s, r) => s + r.count, 0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{formatCurrency(openAmount, company.currency ?? "USD")}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Delivered (total)</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {stats.find((s) => s.status === "DELIVERED")?.count ?? 0}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {formatCurrency(stats.find((s) => s.status === "DELIVERED")?.totalAmount ?? 0, company.currency ?? "USD")}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Cancelled</p>
          <p className="text-2xl font-bold text-rose-500 mt-1">
            {stats.find((s) => s.status === "CANCELLED")?.count ?? 0}
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart className="h-7 w-7" />}
          title="No sales orders"
          description="Create a sales order or convert an accepted quote."
          action={canCreate ? <Button size="sm"><Plus className="h-4 w-4" />New Order</Button> : undefined}
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
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Requested Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => {
                const meta = STATUS_META[order.status];
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/${params.company}/sales/${order.id}`}
                        className="font-mono text-sm font-semibold text-emerald-600 hover:underline"
                      >
                        {order.number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {(order as any).account?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={meta?.variant ?? "default"}>{meta?.label ?? order.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(order.total, order.currency)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {order.requestedDate
                        ? formatDate(order.requestedDate, { month: "short", day: "numeric", year: "numeric" })
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
