import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Package, Tag } from "lucide-react";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { productsService } from "@biogrow/erp-core";
import { Button } from "@biogrow/ui/components/button";
import { Badge } from "@biogrow/ui/components/badge";
import { EmptyState } from "@biogrow/ui/feedback/empty-state";
import { formatCurrency } from "@biogrow/ui/lib/utils";

const TYPE_META: Record<string, { label: string; variant: "default" | "primary" | "secondary" | "success" | "warning" | "danger" }> = {
  PHYSICAL: { label: "Physical", variant: "primary" },
  SERVICE:  { label: "Service",  variant: "success" },
  DIGITAL:  { label: "Digital",  variant: "secondary" },
};

export default async function ProductsPage({ params }: { params: { company: string } }) {

  const { company, permissions } = await resolveCompany(params.company);
  if (!hasPermission(permissions, Permissions.ERP_PRODUCTS_VIEW)) {
    redirect(`/${params.company}/dashboard`);
  }

  const [{ products, total }, categories] = await Promise.all([
    productsService.list({ companyId: company.id, pageSize: 50 }),
    productsService.listCategories(company.id),
  ]);

  const canCreate = hasPermission(permissions, Permissions.ERP_PRODUCTS_CREATE);
  const activeCount = products.filter((p) => p.isActive).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Product Catalog</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} products · {activeCount} active · {categories.length} categories
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/${params.company}/inventory/vendors`}>
            <Button variant="outline" size="sm">
              Vendors
            </Button>
          </Link>
          {canCreate && (
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New Product
            </Button>
          )}
        </div>
      </div>

      {/* Summary KPIs */}
      {total > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(
            products.reduce<Record<string, number>>((acc, p) => {
              acc[p.type] = (acc[p.type] ?? 0) + 1;
              return acc;
            }, {})
          ).map(([type, count]) => {
            const meta = TYPE_META[type];
            return (
              <div key={type} className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-gray-50 flex items-center justify-center">
                  <Package className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-gray-500">{meta?.label ?? type}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Products table */}
      {products.length === 0 ? (
        <EmptyState
          icon={<Package className="h-7 w-7" />}
          title="No products yet"
          description="Add products or services to your company catalog."
          action={canCreate ? <Button size="sm"><Plus className="h-4 w-4" />Create product</Button> : undefined}
        />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Product</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">SKU</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Category</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Unit</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Base Price</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tax %</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => {
                const meta = TYPE_META[product.type];
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/${params.company}/inventory/products/${product.id}`}
                        className="font-medium text-gray-900 hover:text-emerald-600 transition-colors"
                      >
                        {product.name}
                      </Link>
                      {product.description && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{product.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {product.sku ? (
                        <span className="font-mono text-xs text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                          {product.sku}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={meta?.variant ?? "default"}>{meta?.label ?? product.type}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {(product as any).category ? (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <Tag className="h-3 w-3" />
                          {(product as any).category.name}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{product.unit}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(product.basePrice, product.currency)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-500">
                      {product.taxPct > 0 ? `${product.taxPct}%` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={product.isActive ? "success" : "default"}>
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
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
