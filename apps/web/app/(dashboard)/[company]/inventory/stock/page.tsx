import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Package } from "lucide-react";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { inventoryService } from "@biogrow/erp-core";
import { EmptyState } from "@biogrow/ui/feedback/empty-state";
import { Badge } from "@biogrow/ui/components/badge";
import { formatCurrency } from "@biogrow/ui/lib/utils";

export default async function StockPage({ params }: { params: { company: string } }) {

  const { company, permissions } = await resolveCompany(params.company);
  if (!hasPermission(permissions, Permissions.ERP_INVENTORY_VIEW)) {
    redirect(`/${params.company}/dashboard`);
  }

  const { stockItems, lowStock } = await inventoryService.getStockSummary(company.id);

  // Group by product
  const byProduct = stockItems.reduce<Record<string, { product: typeof stockItems[0]["product"]; items: typeof stockItems; totalQty: number }>>((acc, item) => {
    if (!acc[item.productId]) {
      acc[item.productId] = { product: item.product, items: [], totalQty: 0 };
    }
    acc[item.productId].items.push(item);
    acc[item.productId].totalQty += item.quantity;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Current Stock</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {Object.keys(byProduct).length} products · {stockItems.length} locations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/${params.company}/inventory/warehouses`}>
            <Badge variant="default" className="cursor-pointer">Warehouses</Badge>
          </Link>
          <Link href={`/${params.company}/inventory/movements`}>
            <Badge variant="default" className="cursor-pointer">Movements</Badge>
          </Link>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              {lowStock.length} product{lowStock.length > 1 ? "s" : ""} below minimum stock
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              {lowStock.map((s) => s.product.name).join(", ")}
            </p>
          </div>
        </div>
      )}

      {stockItems.length === 0 ? (
        <EmptyState
          icon={<Package className="h-7 w-7" />}
          title="No inventory movements"
          description="Stock is updated automatically with purchase and sales orders."
        />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Product</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">SKU</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Warehouse</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Quantity</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Reserved</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Available</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Unit</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stockItems.map((item) => {
                const isLow = item.minStock != null && item.quantity <= item.minStock;
                const available = item.quantity - item.reservedQty;
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{item.product.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      {item.product.sku ? (
                        <span className="font-mono text-xs text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                          {item.product.sku}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{item.warehouse.name}</td>
                    <td className={`px-4 py-3 text-right font-medium ${isLow ? "text-amber-600" : "text-gray-900"}`}>
                      {item.quantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-500">
                      {item.reservedQty > 0 ? item.reservedQty.toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {available.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{item.product.unit}</td>
                    <td className="px-4 py-3">
                      {isLow ? (
                        <Badge variant="warning">Low Stock</Badge>
                      ) : (
                        <Badge variant="success">OK</Badge>
                      )}
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
