import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { quotesService } from "@biogrow/crm-core";
import { Badge } from "@biogrow/ui/components/badge";
import { Avatar } from "@biogrow/ui/components/avatar";
import { formatCurrency, formatDate } from "@biogrow/ui/lib/utils";

const STATUS_META: Record<string, { label: string; variant: "default" | "primary" | "secondary" | "success" | "warning" | "danger" }> = {
  DRAFT:    { label: "Draft",    variant: "secondary" },
  SENT:     { label: "Sent",     variant: "primary"   },
  VIEWED:   { label: "Viewed",   variant: "warning"   },
  ACCEPTED: { label: "Accepted", variant: "success"   },
  REJECTED: { label: "Rejected", variant: "danger"    },
  EXPIRED:  { label: "Expired",  variant: "default"   },
};

export default async function QuoteDetailPage({
  params,
}: {
  params: { company: string; id: string };
}) {

  const { company, permissions } = await resolveCompany(params.company);
  if (!hasPermission(permissions, Permissions.CRM_QUOTES_VIEW)) {
    redirect(`/${params.company}/crm/quotes`);
  }

  const quote = await quotesService.getById(params.id);
  if (!quote || quote.companyId !== company.id) notFound();

  const meta = STATUS_META[quote.status];
  const isExpired = quote.validUntil && quote.status !== "ACCEPTED" && new Date(quote.validUntil) < new Date();

  return (
    <div className="space-y-5">
      <div>
        <Link
          href={`/${params.company}/crm/quotes`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Quotes
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-mono">{quote.number}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {(quote as any).account?.name ?? "—"}
              {(quote as any).opportunity && ` · ${(quote as any).opportunity.name}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={meta?.variant ?? "default"}>{meta?.label ?? quote.status}</Badge>
            {isExpired && <Badge variant="danger">Expired</Badge>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          {/* Line items */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">Line Items</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Disc %</th>
                  <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(quote as any).lineItems?.map((li: any) => (
                  <tr key={li.id}>
                    <td className="px-5 py-3 text-sm text-gray-800">{li.description}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700">{li.quantity}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700">{formatCurrency(li.unitPrice, quote.currency)}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-500">{li.discountPct > 0 ? `${li.discountPct}%` : "—"}</td>
                    <td className="px-5 py-3 text-right text-sm font-medium text-gray-900">{formatCurrency(li.total, quote.currency)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-100">
                <tr>
                  <td colSpan={4} className="px-5 py-2.5 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</td>
                  <td className="px-5 py-2.5 text-right text-sm font-medium text-gray-900">{formatCurrency(quote.subtotal, quote.currency)}</td>
                </tr>
                {quote.discountPct > 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-2 text-right text-xs text-gray-400">Discount ({quote.discountPct}%)</td>
                    <td className="px-5 py-2 text-right text-sm text-rose-500">−{formatCurrency(quote.subtotal * quote.discountPct / 100, quote.currency)}</td>
                  </tr>
                )}
                {quote.taxPct > 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-2 text-right text-xs text-gray-400">Tax ({quote.taxPct}%)</td>
                    <td className="px-5 py-2 text-right text-sm text-gray-700">{formatCurrency((quote.subtotal * (1 - quote.discountPct / 100)) * quote.taxPct / 100, quote.currency)}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan={4} className="px-5 py-3 text-right text-sm font-bold text-gray-700 uppercase">Total</td>
                  <td className="px-5 py-3 text-right text-base font-bold text-gray-900">{formatCurrency(quote.total, quote.currency)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Notes / Terms */}
          {(quote.notes || quote.terms) && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
              {quote.notes && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Notes</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{quote.notes}</p>
                </div>
              )}
              {quote.terms && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Terms & Conditions</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{quote.terms}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right */}
        <div className="space-y-5">
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">Quote Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <Badge variant={meta?.variant ?? "default"}>{meta?.label ?? quote.status}</Badge>
              </div>
              {(quote as any).account && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Account</span>
                  <Link href={`/${params.company}/crm/accounts/${(quote as any).account.id}`} className="text-emerald-600 hover:underline text-xs font-medium">
                    {(quote as any).account.name}
                  </Link>
                </div>
              )}
              {(quote as any).opportunity && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Opportunity</span>
                  <Link href={`/${params.company}/crm/opportunities/${(quote as any).opportunity.id}`} className="text-emerald-600 hover:underline text-xs font-medium">
                    {(quote as any).opportunity.name}
                  </Link>
                </div>
              )}
              {quote.validUntil && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Valid Until</span>
                  <span className={`text-xs font-medium ${isExpired ? "text-rose-500" : "text-gray-700"}`}>
                    {formatDate(quote.validUntil, { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              )}
              {(quote as any).owner && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Owner</span>
                  <div className="flex items-center gap-1.5">
                    <Avatar src={(quote as any).owner.avatarUrl} name={(quote as any).owner.name} size="xs" />
                    <span className="text-xs text-gray-700">{(quote as any).owner.name}</span>
                  </div>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-700">{formatDate(quote.createdAt, { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Summary</h2>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">{formatCurrency(quote.subtotal, quote.currency)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="font-semibold text-gray-700">Total</span>
                <span className="font-bold text-lg text-gray-900">{formatCurrency(quote.total, quote.currency)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
