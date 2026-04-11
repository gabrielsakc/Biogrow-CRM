"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Users } from "lucide-react";
import { api } from "@/lib/trpc/client";
import { Button } from "@biogrow/ui/components/button";
import { Input } from "@biogrow/ui/components/input";
import { Label } from "@biogrow/ui/components/label";

const SOURCES = [
  { value: "WEBSITE", label: "Website" },
  { value: "REFERRAL", label: "Referral" },
  { value: "COLD_OUTREACH", label: "Cold Outreach" },
  { value: "EVENT", label: "Event" },
  { value: "SOCIAL_MEDIA", label: "Social Media" },
  { value: "PAID_ADS", label: "Paid Ads" },
  { value: "EMAIL_CAMPAIGN", label: "Email Campaign" },
  { value: "PARTNER", label: "Partner" },
  { value: "OTHER", label: "Other" },
];

interface QuickLeadModalProps {
  companyId: string;
  companySlug: string;
  onClose: () => void;
}

export function QuickLeadModal({ companyId, companySlug, onClose }: QuickLeadModalProps) {
  const router = useRouter();
  const utils = api.useUtils();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyName: "",
    source: "OTHER" as const,
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const mutation = api.leads.create.useMutation({
    onSuccess: (lead) => {
      utils.leads.list.invalidate({ companyId });
      utils.crmDashboard.getKPIs.invalidate({ companyId });
      router.push(`/${companySlug}/crm/leads/${lead.id}`);
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      companyId,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email || undefined,
      phone: form.phone || undefined,
      companyName: form.companyName || undefined,
      source: form.source,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">New Lead</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName">First name *</Label>
              <Input
                id="firstName"
                value={form.firstName}
                onChange={set("firstName")}
                placeholder="John"
                required
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last name *</Label>
              <Input
                id="lastName"
                value={form.lastName}
                onChange={set("lastName")}
                placeholder="Smith"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="leadEmail">Email</Label>
            <Input
              id="leadEmail"
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="john@company.com"
            />
          </div>

          {/* Phone + Company */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="leadPhone">Phone</Label>
              <Input
                id="leadPhone"
                type="tel"
                value={form.phone}
                onChange={set("phone")}
                placeholder="+1 555 000 0000"
              />
            </div>
            <div>
              <Label htmlFor="leadCompany">Company</Label>
              <Input
                id="leadCompany"
                value={form.companyName}
                onChange={set("companyName")}
                placeholder="Acme Corp"
              />
            </div>
          </div>

          {/* Source */}
          <div>
            <Label htmlFor="leadSource">Source</Label>
            <select
              id="leadSource"
              value={form.source}
              onChange={set("source")}
              className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {SOURCES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Error */}
          {mutation.error && (
            <p className="text-xs text-red-600 bg-red-50 rounded px-3 py-2">
              {mutation.error.message}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending || !form.firstName || !form.lastName}
            >
              {mutation.isPending ? "Creating..." : "Create Lead"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
