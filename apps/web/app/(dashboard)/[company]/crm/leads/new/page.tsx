"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/trpc/client";
import { Button } from "@biogrow/ui/components/button";
import { Input } from "@biogrow/ui/components/input";
import { Label } from "@biogrow/ui/components/label";
import { Textarea } from "@biogrow/ui/components/textarea";
import { Select } from "@biogrow/ui/components/select";
import { Card, CardContent, CardHeader, CardTitle } from "@biogrow/ui/components/card";

const SOURCE_OPTIONS = [
  { value: "", label: "Select source..." },
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

export default function NewLeadPage({ params }: { params: { company: string } }) {
  const router = useRouter();
  const utils = api.useUtils();

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

  const createMutation = api.leads.create.useMutation({
    onSuccess: () => {
      utils.leads.list.invalidate();
      router.push(`/${params.company}/crm/leads`);
    },
    onError: (error) => {
      console.error("Failed to create lead:", error);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    createMutation.mutate({
      companyId: params.company,
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${params.company}/crm/leads`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">New Lead</h1>
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
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  placeholder="Doe"
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
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="companyName">Company</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => updateField("companyName", e.target.value)}
                placeholder="Acme Inc."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) => updateField("jobTitle", e.target.value)}
                  placeholder="CEO, Manager, etc."
                />
              </div>
              <div>
                <Label htmlFor="source">Lead Source</Label>
                <Select
                  value={formData.source}
                  onChange={(e) => updateField("source", e.target.value)}
                  options={SOURCE_OPTIONS.filter(opt => opt.value !== "")}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Notes</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Additional notes about this lead..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Link href={`/${params.company}/crm/leads`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting || !formData.firstName || !formData.lastName}>
            {isSubmitting ? "Creating..." : "Create Lead"}
          </Button>
        </div>
      </form>
    </div>
  );
}