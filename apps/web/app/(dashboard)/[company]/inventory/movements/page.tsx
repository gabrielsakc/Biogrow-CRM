import { redirect } from "next/navigation";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { inventoryService } from "@biogrow/erp-core";
import { Badge } from "@biogrow/ui/components/badge";
import { Avatar } from "@biogrow/ui/components/avatar";
import { formatDate } from "@biogrow/ui/lib/utils";

const MOVEMENT_META: Record<string, { label: string; in: boolean }> = {
  PURCHASE_RECEIPT:  { label: "PO Receipt",       in: true  },
  SALE_SHIPMENT:     { label: "SO Shipment",       in: false },
  ADJUSTMENT_IN:     { label: "Adjustment In",    in: true  },
  ADJUSTMENT_OUT:    { label: "Adjustment Out",   in: false },
  TRANSFER_IN:       { label: "Transfer In",      in: true  },
  TRANSFER_OUT:      { label: "Transfer Out",     in: false },
  RETURN_IN:         { label: "Return In",        in: true  },
  RETURN_OUT:        { label: "Return Out",       in: false },
};

export default async function MovementsPage({ params }: { params: { company: string } }) {

  const { company, permissions } = await resolveCompany(params.company);
  if (!hasPermission(permissions, Permissions.ERP_INVENTORY_VIEW)) {
    redirect(`/${params.company}/dashboard`);
  }

  const movements = await inventoryService.listMovements({ companyId: company.id, limit: 100 });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Inventory Movements</h1>
        <p className="text-sm text-gray-500 mt-0.5">{movements.length} recent movements</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Type</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Product</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Warehouse</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Quantity</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Reference</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">User</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {movements.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">
                  No movements recorded
                </td>
              </tr>
            ) : movements.map((m) => {
              const meta = MOVEMENT_META[m.type];
              return (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {meta?.in ? (
                        <ArrowDownCircle className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <ArrowUpCircle className="h-4 w-4 text-rose-500" />
                      )}
                      <span className="text-xs text-gray-600">{meta?.label ?? m.type}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{m.product.name}</p>
                    {m.product.sku && (
                      <span className="font-mono text-xs text-gray-400">{m.product.sku}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{m.warehouse.name}</td>
                  <td className={`px-4 py-3 text-right font-bold ${m.quantity >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {m.quantity >= 0 ? "+" : ""}{m.quantity} {m.product.unit}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{m.reference ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar src={undefined} name={m.user.name} size="xs" />
                      <span className="text-xs text-gray-500">{m.user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {formatDate(m.occurredAt, { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
