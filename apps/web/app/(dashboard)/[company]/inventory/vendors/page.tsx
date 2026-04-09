import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Truck } from "lucide-react";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { vendorsService } from "@biogrow/erp-core";
import { Button } from "@biogrow/ui/components/button";
import { Badge } from "@biogrow/ui/components/badge";
import { EmptyState } from "@biogrow/ui/feedback/empty-state";

const STATUS_META: Record<string, { label: string; variant: "default" | "primary" | "success" | "warning" | "danger" }> = {
  ACTIVE:   { label: "Active",   variant: "success" },
  INACTIVE: { label: "Inactive", variant: "default" },
  BLOCKED:  { label: "Blocked",  variant: "danger" },
};

export default async function VendorsPage({ params }: { params: { company: string } }) {

  const { company, permissions } = await resolveCompany(params.company);
  if (!hasPermission(permissions, Permissions.ERP_VENDORS_VIEW)) {
    redirect(`/${params.company}/dashboard`);
  }

  const { vendors, total } = await vendorsService.list({ companyId: company.id, pageSize: 50 });
  const canCreate = hasPermission(permissions, Permissions.ERP_VENDORS_CREATE);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Vendors</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} vendors registered</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/${params.company}/inventory/products`}>
            <Button variant="outline" size="sm">Products</Button>
          </Link>
          {canCreate && (
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New Vendor
            </Button>
          )}
        </div>
      </div>

      {vendors.length === 0 ? (
        <EmptyState
          icon={<Truck className="h-7 w-7" />}
          title="No vendors yet"
          description="Add vendors to your company to manage purchasing."
          action={canCreate ? <Button size="sm"><Plus className="h-4 w-4" />Add vendor</Button> : undefined}
        />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Vendor</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tax ID</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Country</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Payment Terms</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Currency</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {vendors.map((vendor) => {
                const meta = STATUS_META[vendor.status];
                return (
                  <tr key={vendor.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/${params.company}/inventory/vendors/${vendor.id}`}
                        className="font-medium text-gray-900 hover:text-emerald-600 transition-colors"
                      >
                        {vendor.name}
                      </Link>
                      {vendor.legalName && vendor.legalName !== vendor.name && (
                        <p className="text-xs text-gray-400 mt-0.5">{vendor.legalName}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {vendor.taxId ? (
                        <span className="font-mono text-xs text-gray-600">{vendor.taxId}</span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        {vendor.contactName && (
                          <p className="text-xs font-medium text-gray-700">{vendor.contactName}</p>
                        )}
                        {vendor.contactEmail && (
                          <p className="text-xs text-gray-400">{vendor.contactEmail}</p>
                        )}
                        {!vendor.contactName && !vendor.contactEmail && (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{vendor.country ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {vendor.paymentTermsDays != null ? `${vendor.paymentTermsDays} days` : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-gray-600">{vendor.currency}</td>
                    <td className="px-4 py-3">
                      <Badge variant={meta?.variant ?? "default"}>{meta?.label ?? vendor.status}</Badge>
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
