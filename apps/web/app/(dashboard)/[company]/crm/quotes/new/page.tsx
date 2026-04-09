import { redirect } from "next/navigation";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { QuoteBuilder } from "@/components/crm/quote-builder";

export default async function NewQuotePage({
  params,
  searchParams,
}: {
  params: { company: string };
  searchParams: { accountId?: string; opportunityId?: string };
}) {

  const { company, permissions } = await resolveCompany(params.company);
  if (!hasPermission(permissions, Permissions.CRM_QUOTES_CREATE)) {
    redirect(`/${params.company}/crm/quotes`);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">New Quote</h1>
        <p className="text-sm text-gray-500 mt-0.5">Fill in the details and add line items</p>
      </div>

      <QuoteBuilder
        companyId={company.id}
        companySlug={params.company}
        accountId={searchParams.accountId}
        opportunityId={searchParams.opportunityId}
      />
    </div>
  );
}
