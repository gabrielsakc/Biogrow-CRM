import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Globe, MapPin } from "lucide-react";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { vendorsService } from "@biogrow/erp-core";
import { Badge } from "@biogrow/ui/components/badge";

const STATUS_META: Record<string, { label: string; variant: "default" | "primary" | "success" | "warning" | "danger" }> = {
  ACTIVE:   { label: "Active",   variant: "success" },
  INACTIVE: { label: "Inactive", variant: "default" },
  BLOCKED:  { label: "Blocked",  variant: "danger"  },
};

export default async function VendorDetailPage({
  params,
}: {
  params: { company: string; id: string };
}) {

  const { company, permissions } = await resolveCompany(params.company);
  if (!hasPermission(permissions, Permissions.ERP_VENDORS_VIEW)) {
    redirect(`/${params.company}/dashboard`);
  }

  const vendor = await vendorsService.getById(params.id, company.id);
  if (!vendor) notFound();

  const meta = STATUS_META[vendor.status];
  const address = [vendor.street, vendor.city, vendor.state, vendor.zip, vendor.country].filter(Boolean).join(", ");

  return (
    <div className="space-y-5">
      <div>
        <Link
          href={`/${params.company}/inventory/vendors`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Vendors
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{vendor.name}</h1>
            {vendor.legalName && vendor.legalName !== vendor.name && (
              <p className="text-sm text-gray-400 mt-0.5">{vendor.legalName}</p>
            )}
          </div>
          <Badge variant={meta?.variant ?? "default"}>{meta?.label ?? vendor.status}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Vendor Information</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {vendor.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                  <a href={`mailto:${vendor.email}`} className="text-emerald-600 hover:underline">{vendor.email}</a>
                </div>
              )}
              {vendor.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-gray-700">{vendor.phone}</span>
                </div>
              )}
              {vendor.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-400 shrink-0" />
                  <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline truncate">{vendor.website}</a>
                </div>
              )}
              {address && (
                <div className="flex items-start gap-2 col-span-2">
                  <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                  <span className="text-gray-700">{address}</span>
                </div>
              )}
            </div>
            {vendor.notes && (
              <p className="mt-4 text-sm text-gray-500 border-t border-gray-100 pt-4">{vendor.notes}</p>
            )}
          </div>

          {(vendor.contactName || vendor.contactEmail || vendor.contactPhone) && (
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Primary Contact</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {vendor.contactName && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Name</p>
                    <p className="font-medium text-gray-900">{vendor.contactName}</p>
                  </div>
                )}
                {vendor.contactEmail && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Email</p>
                    <a href={`mailto:${vendor.contactEmail}`} className="text-emerald-600 hover:underline">{vendor.contactEmail}</a>
                  </div>
                )}
                {vendor.contactPhone && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                    <p className="text-gray-700">{vendor.contactPhone}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">Commercial Terms</h2>
            <div className="space-y-2 text-sm">
              {vendor.taxId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax ID</span>
                  <span className="font-mono text-gray-900">{vendor.taxId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Currency</span>
                <span className="font-medium text-gray-900">{vendor.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Terms</span>
                <span className="font-medium text-gray-900">
                  {vendor.paymentTermsDays != null ? `${vendor.paymentTermsDays} days` : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <Badge variant={meta?.variant ?? "default"}>{meta?.label ?? vendor.status}</Badge>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-2">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Quick links</h2>
            <Link
              href={`/${params.company}/sales/purchasing`}
              className="block text-sm text-emerald-600 hover:underline"
            >
              Purchase orders →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
