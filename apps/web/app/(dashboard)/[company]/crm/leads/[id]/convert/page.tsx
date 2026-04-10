"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Building2, User, Target, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/trpc/client";
import { Button } from "@biogrow/ui/components/button";
import { Input } from "@biogrow/ui/components/input";
import { Label } from "@biogrow/ui/components/label";
import { Checkbox } from "@biogrow/ui/components/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@biogrow/ui/components/card";
import { Badge } from "@biogrow/ui/components/badge";
import { formatCurrency } from "@biogrow/ui/lib/utils";

export default function ConvertLeadPage({ params }: { params: { company: string; id: string } }) {
  const router = useRouter();
  const utils = api.useUtils();

  const { data: lead, isLoading } = api.leads.getById.useQuery({
    companyId: params.company,
    id: params.id,
  });

  const { data: pipelineStages } = api.pipeline.getStages.useQuery({
    companyId: params.company,
  });

  const [formData, setFormData] = useState({
    createAccount: true,
    accountName: "",
    createContact: true,
    createOpportunity: true,
    opportunityName: "",
    opportunityAmount: "",
    stageId: "",
    expectedCloseDate: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (lead) {
      setFormData((prev) => ({
        ...prev,
        accountName: lead.companyName ?? `${lead.firstName} ${lead.lastName}'s Company`,
        opportunityName: `${lead.firstName} ${lead.lastName} — Opportunity`,
      }));
    }
  }, [lead]);

  useEffect(() => {
    if (pipelineStages && pipelineStages.length > 0 && !formData.stageId) {
      // Select first non-won/non-lost stage by default
      const firstStage = pipelineStages.find((s: any) => !s.isWon && !s.isLost) || pipelineStages[0];
      setFormData((prev) => ({ ...prev, stageId: firstStage.id }));
    }
  }, [pipelineStages]);

  const convertMutation = api.leads.convert.useMutation({
    onSuccess: () => {
      utils.leads.list.invalidate();
      utils.leads.getById.invalidate({ companyId: params.company, id: params.id });
      router.push(`/${params.company}/crm/leads`);
    },
    onError: (error) => {
      console.error("Failed to convert lead:", error);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    convertMutation.mutate({
      companyId: params.company,
      leadId: params.id,
      createAccount: formData.createAccount,
      accountName: formData.accountName || undefined,
      createContact: formData.createContact,
      createOpportunity: formData.createOpportunity,
      opportunityName: formData.opportunityName || undefined,
      opportunityAmount: formData.opportunityAmount ? parseFloat(formData.opportunityAmount) : undefined,
      stageId: formData.stageId || undefined,
      expectedCloseDate: formData.expectedCloseDate ? new Date(formData.expectedCloseDate) : undefined,
    });
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

  if (lead.status === "CONVERTED") {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-gray-900 mb-2">Lead Already Converted</h2>
        <p className="text-gray-500 mb-4">This lead has already been converted.</p>
        <Link href={`/${params.company}/crm/leads`}>
          <Button variant="outline">Back to Leads</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${params.company}/crm/leads/${params.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Convert Lead</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {lead.firstName} {lead.lastName} {lead.companyName ? `· ${lead.companyName}` : ""}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <CardTitle className="text-sm">Create Account</CardTitle>
              </div>
              <Checkbox
                checked={formData.createAccount}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, createAccount: checked as boolean }))}
              />
            </div>
          </CardHeader>
          {formData.createAccount && (
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  value={formData.accountName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, accountName: e.target.value }))}
                  placeholder="Company name"
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Contact Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <CardTitle className="text-sm">Create Contact</CardTitle>
              </div>
              <Checkbox
                checked={formData.createContact}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, createContact: checked as boolean }))}
              />
            </div>
          </CardHeader>
          {formData.createContact && (
            <CardContent>
              <p className="text-sm text-gray-500">
                Contact will be created with name: <span className="font-medium">{lead.firstName} {lead.lastName}</span>
                {lead.email && <>, email: <span className="font-medium">{lead.email}</span></>}
              </p>
            </CardContent>
          )}
        </Card>

        {/* Opportunity Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-gray-500" />
                <CardTitle className="text-sm">Create Opportunity</CardTitle>
              </div>
              <Checkbox
                checked={formData.createOpportunity}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, createOpportunity: checked as boolean }))}
              />
            </div>
          </CardHeader>
          {formData.createOpportunity && (
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="opportunityName">Opportunity Name</Label>
                <Input
                  id="opportunityName"
                  value={formData.opportunityName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, opportunityName: e.target.value }))}
                  placeholder="Opportunity name"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.opportunityAmount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, opportunityAmount: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="stage">Pipeline Stage</Label>
                  <select
                    id="stage"
                    value={formData.stageId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, stageId: e.target.value }))}
                    className="flex h-9 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                  >
                    {pipelineStages?.map((stage: any) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
                <Input
                  id="expectedCloseDate"
                  type="date"
                  value={formData.expectedCloseDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, expectedCloseDate: e.target.value }))}
                />
              </div>
            </CardContent>
          )}
        </Card>

        <div className="flex justify-end gap-3">
          <Link href={`/${params.company}/crm/leads/${params.id}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting || (!formData.createAccount && !formData.createContact && !formData.createOpportunity)}>
            {isSubmitting ? "Converting..." : "Convert Lead"}
          </Button>
        </div>
      </form>
    </div>
  );
}