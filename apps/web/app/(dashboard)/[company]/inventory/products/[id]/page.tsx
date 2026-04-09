import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Tag } from "lucide-react";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { productsService } from "@biogrow/erp-core";
import { Badge } from "@biogrow/ui/components/badge";
import { formatCurrency } from "@biogrow/ui/lib/utils";

const TYPE_META: Record<string, { label: string; variant: "default" | "primary" | "secondary" | "success" | "warning" | "danger" }> = {
  PHYSICAL: { label: "Physical", variant: "primary"   },
  SERVICE:  { label: "Service",  variant: "success"   },
  DIGITAL:  { label: "Digital",  variant: "secondary" },
};

export default async function ProductDetailPage({
  params,
}: {
  params: { company: string; id: string };
}) {

  const { company, permissions } = await resolveCompany(params.company);
  if (!hasPermission(permissions, Permissions.ERP_PRODUCTS_VIEW)) {
    redirect(`/${params.company}/dashboard`);
  }

  const product = await productsService.getById(params.id, company.id);
  if (!product) notFound();

  const typeMeta = TYPE_META[product.type];

  return (
    <div className="space-y-5">
      <div>
        <Link
          href={`/${params.company}/inventory/products`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Products
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>
            {product.sku && (
              <span className="mt-1 inline-block font-mono text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                {product.sku}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={typeMeta?.variant ?? "default"}>{typeMeta?.label ?? product.type}</Badge>
            <Badge variant={product.isActive ? "success" : "default"}>
              {product.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Product Information</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Type</p>
                <Badge variant={typeMeta?.variant ?? "default"}>{typeMeta?.label ?? product.type}</Badge>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Unit</p>
                <span className="font-medium text-gray-900">{product.unit}</span>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Base Price</p>
                <span className="font-bold text-gray-900 text-base">{formatCurrency(product.basePrice, product.currency)}</span>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Tax Rate</p>
                <span className="font-medium text-gray-900">{product.taxPct > 0 ? `${product.taxPct}%` : "—"}</span>
              </div>
              {(product as any).category && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Category</p>
                  <span className="inline-flex items-center gap-1 text-sm text-gray-700">
                    <Tag className="h-3 w-3" />
                    {(product as any).category.name}
                  </span>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Currency</p>
                <span className="font-medium text-gray-900">{product.currency}</span>
              </div>
            </div>
            {product.description && (
              <p className="mt-4 text-sm text-gray-500 border-t border-gray-100 pt-4">{product.description}</p>
            )}
          </div>

          {/* Price list items */}
          {(product as any).priceListItems?.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700">Price Lists</h2>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase">Price List</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Currency</th>
                    <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500 uppercase">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(product as any).priceListItems.map((pli: any) => (
                    <tr key={pli.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-sm font-medium text-gray-900">{pli.priceList.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{pli.priceList.currency}</td>
                      <td className="px-5 py-3 text-right font-bold text-gray-900">{formatCurrency(pli.price, pli.priceList.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <Badge variant={product.isActive ? "success" : "default"}>
                  {product.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Base Price</span>
                <span className="font-bold text-gray-900">{formatCurrency(product.basePrice, product.currency)}</span>
              </div>
              {product.taxPct > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Price + Tax</span>
                  <span className="font-medium text-gray-700">
                    {formatCurrency(product.basePrice * (1 + product.taxPct / 100), product.currency)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-2">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Quick links</h2>
            <Link
              href={`/${params.company}/inventory/stock?product=${product.id}`}
              className="block text-sm text-emerald-600 hover:underline"
            >
              View stock levels →
            </Link>
            <Link
              href={`/${params.company}/inventory/movements`}
              className="block text-sm text-emerald-600 hover:underline"
            >
              View movements →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
