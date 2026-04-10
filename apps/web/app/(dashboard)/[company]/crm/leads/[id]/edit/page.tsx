"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { api } from "@/lib/trpc/client";
import { Button } from "@biogrow/ui/components/button";
import { Input } from "@biogrow/ui/components/input";
import { Label } from "@biogrow/ui/components/label";
import { Textarea } from "@biogrow/ui/components/textarea";
import { Select } from "@biogrow/ui/components/select";
import { Card, CardContent, CardHeader, CardTitle } from "@biogrow/ui/components/card";
import { Badge } from "@biogrow/ui/components/badge";

const SOURCE_OPTIONS = [
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

const STATUS_OPTIONS = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "UNQUALIFIED", label: "Unqualified" },
  { value: "CONVERTED", label: "Converted" },
];

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-gray-100 text-gray-700",
  CONTACTED: "bg-amber-100 text-amber-700",
  QUALIFIED: "bg-blue-100 text-blue-700",
  UNQUALIFIED: "bg-red-100 text-red-700",
  CONVERTED: "bg-emerald-100 text-emerald-700",
};

export default function EditLeadPage({ params }: { params: { company: string; id: string } }) {
  const router = useRouter();
  const utils = api.useUtils();

  const { data: lead, isLoading } = api.leads.getById.useQuery({
    companyId: params.company,
    id: params.id,
  });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyName: "",
    jobTitle: "",
    source: "OTHER",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (lead) {
      setFormData({
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email ?? "",
        phone: lead.phone ?? "",
        companyName: lead.companyName ?? "",
        jobTitle: lead.jobTitle ?? "",
        source: lead.source,
        description: lead.description ?? "",
      });
    }
  }, [lead]);

  const updateMutation = api.leads.update.useMutation({
    onSuccess: () => {
      utils.leads.getById.invalidate({ companyId: params.company, id: params.id });
      utils.leads.list.invalidate();
      router.push(`/${params.company}/crm/leads/${params.id}`);
    },
    onError: (error) => {
      console.error("Failed to update lead:", error);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    updateMutation.mutate({
      companyId: params.company,
      id: params.id,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      companyName: formData.companyName || undefined,
      jobTitle: formData.jobTitle || undefined,
      source: formData.source as any,
      description: formData.description || undefined,
    });
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Lead not found</p>
        <Link href={`/${params.company}/crm/leads`} className="text-sm text-emerald-600 hover:underline mt-2 block">
          Back to leads
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${params.company}/crm/leads/${params.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Edit Lead</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-gray-500">{lead.firstName} {lead.lastName}</span>
              <Badge className={STATUS_COLORS[lead.status]}>{lead.status}</Badge>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Lead Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="companyName">Company</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => updateField("companyName", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) => updateField("jobTitle", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="source">Lead Source</Label>
                <Select
                  value={formData.source}
                  onChange={(e) => updateField("source", e.target.value)}
                  options={SOURCE_OPTIONS}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Notes</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Link href={`/${params.company}/crm/leads/${params.id}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting || !formData.firstName || !formData.lastName}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}