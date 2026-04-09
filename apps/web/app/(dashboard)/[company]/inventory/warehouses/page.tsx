import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Warehouse } from "lucide-react";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { inventoryService } from "@biogrow/erp-core";
import { Button } from "@biogrow/ui/components/button";
import { Badge } from "@biogrow/ui/components/badge";
import { EmptyState } from "@biogrow/ui/feedback/empty-state";

export default async function WarehousesPage({ params }: { params: { company: string } }) {

  const { company, permissions } = await resolveCompany(params.company);
  if (!hasPermission(permissions, Permissions.ERP_WAREHOUSES_VIEW)) {
    redirect(`/${params.company}/dashboard`);
  }

  const warehouses = await inventoryService.listWarehouses(company.id);
  const canManage = hasPermission(permissions, Permissions.ERP_WAREHOUSES_MANAGE);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Warehouses</h1>
          <p className="text-sm text-gray-500 mt-0.5">{warehouses.length} warehouses configured</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/${params.company}/inventory/stock`}>
            <Button variant="outline" size="sm">View Stock</Button>
          </Link>
          {canManage && (
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New Warehouse
            </Button>
          )}
        </div>
      </div>

      {warehouses.length === 0 ? (
        <EmptyState
          icon={<Warehouse className="h-7 w-7" />}
          title="No warehouses configured"
          description="Create at least one warehouse to manage inventory."
          action={canManage ? <Button size="sm"><Plus className="h-4 w-4" />Create warehouse</Button> : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {warehouses.map((warehouse) => (
            <div key={warehouse.id} className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Warehouse className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex items-center gap-2">
                  {warehouse.isDefault && (
                    <Badge variant="success">Default</Badge>
                  )}
                  <Badge variant={warehouse.isActive ? "success" : "default"}>
                    {warehouse.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{warehouse.name}</p>
                {warehouse.code && (
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{warehouse.code}</p>
                )}
                {warehouse.address && (
                  <p className="text-xs text-gray-400 mt-1">{warehouse.address}</p>
                )}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  {(warehouse as any)._count?.stockItems ?? 0} products in stock
                </span>
                <Link
                  href={`/${params.company}/inventory/stock?warehouse=${warehouse.id}`}
                  className="text-xs text-emerald-600 font-medium hover:underline"
                >
                  View stock →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
