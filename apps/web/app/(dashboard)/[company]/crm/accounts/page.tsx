import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { accountsService } from "@biogrow/crm-core";
import { Button } from "@biogrow/ui/components/button";
import { Badge } from "@biogrow/ui/components/badge";
import { EmptyState } from "@biogrow/ui/feedback/empty-state";
import { Avatar } from "@biogrow/ui/components/avatar";
import { AccountsFilters } from "@/components/crm/accounts-filters";

const TYPE_VARIANT: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
  PROSPECT: "secondary",
  CUSTOMER: "success",
  PARTNER: "primary",
  VENDOR: "default",
  CHURNED: "danger",
};

const TYPE_LABEL: Record<string, string> = {
  PROSPECT: "Prospect", CUSTOMER: "Customer", PARTNER: "Partner",
  VENDOR: "Vendor", CHURNED: "Churned",
};

function HealthBar({ score }: { score: number }) {
  const color = score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs text-gray-500">{score}</span>
    </div>
  );
}

export default async function AccountsPage({
  params,
  searchParams,
}: {
  params: { company: string };
  searchParams: { type?: string; search?: string; page?: string };
}) {
  const { company, permissions } = await resolveCompany(params.company);
  if (!hasPermission(permissions, Permissions.CRM_ACCOUNTS_VIEW)) {
    redirect(`/${params.company}/dashboard`);
  }

  const page = parseInt(searchParams.page || "1", 10);
  const pageSize = 25;

  const { accounts, total } = await accountsService.list({
    companyId: company.id,
    type: searchParams.type as "PROSPECT" | "CUSTOMER" | "PARTNER" | "VENDOR" | "CHURNED" | undefined,
    search: searchParams.search,
    page,
    pageSize,
  });

  const canCreate = hasPermission(permissions, Permissions.CRM_ACCOUNTS_CREATE);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Accounts</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} accounts</p>
        </div>
        {canCreate && (
          <Link href={`/${params.company}/crm/accounts/new`}>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New Account
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <AccountsFilters companySlug={params.company} />

      {accounts.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-7 w-7" />}
          title="No accounts yet"
          description="Add your first customer or prospect account."
          action={canCreate ? <Button size="sm"><Plus className="h-4 w-4" />Create account</Button> : undefined}
        />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Account</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Industry</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Health</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Contacts</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Opps</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {accounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/${params.company}/crm/accounts/${account.id}`}
                      className="font-medium text-gray-900 hover:text-emerald-600 transition-colors"
                    >
                      {account.name}
                    </Link>
                    {account.website && (
                      <p className="text-xs text-gray-400 mt-0.5">{account.website}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={TYPE_VARIANT[account.type] ?? "default"}>
                      {TYPE_LABEL[account.type] ?? account.type}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{account.industry ?? "—"}</td>
                  <td className="px-4 py-3"><HealthBar score={account.healthScore} /></td>
                  <td className="px-4 py-3 text-center text-gray-600">{(account as any)._count?.contacts ?? 0}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{(account as any)._count?.opportunities ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar src={(account as any).owner?.avatarUrl} name={(account as any).owner?.name ?? "?"} size="xs" />
                      <span className="text-xs text-gray-500">{(account as any).owner?.name}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/${params.company}/crm/accounts?${new URLSearchParams({
                      ...(searchParams.type && { type: searchParams.type }),
                      ...(searchParams.search && { search: searchParams.search }),
                      page: String(page - 1),
                    }).toString()}`}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/${params.company}/crm/accounts?${new URLSearchParams({
                      ...(searchParams.type && { type: searchParams.type }),
                      ...(searchParams.search && { search: searchParams.search }),
                      page: String(page + 1),
                    }).toString()}`}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
