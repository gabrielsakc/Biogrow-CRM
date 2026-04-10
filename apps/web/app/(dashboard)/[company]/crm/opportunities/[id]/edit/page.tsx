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
import { Card, CardContent, CardHeader, CardTitle } from "@biogrow/ui/components/card";
import { Badge } from "@biogrow/ui/components/badge";

const FORECAST_OPTIONS = [
  { value: "PIPELINE", label: "Pipeline" },
  { value: "BEST_CASE", label: "Best Case" },
  { value: "COMMIT", label: "Commit" },
  { value: "CLOSED_WON", label: "Closed Won" },
  { value: "CLOSED_LOST", label: "Closed Lost" },
  { value: "OMITTED", label: "Omitted" },
];

export default function EditOpportunityPage({ params }: { params: { company: string; id: string } }) {
  const router = useRouter();
  const utils = api.useUtils();

  const { data: opportunity, isLoading } = api.opportunities.getById.useQuery({
    companyId: params.company,
    id: params.id,
  });

  const { data: pipelineStages } = api.pipeline.getStages.useQuery({
    companyId: params.company,
  });

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    stageId: "",
    forecastCategory: "PIPELINE",
    expectedCloseDate: "",
    description: "",
    nextStep: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (opportunity) {
      setFormData({
        name: opportunity.name,
        amount: opportunity.amount?.toString() ?? "",
        stageId: opportunity.stageId,
        forecastCategory: opportunity.forecastCategory,
        expectedCloseDate: opportunity.expectedCloseDate
          ? new Date(opportunity.expectedCloseDate).toISOString().split("T")[0]
          : "",
        description: opportunity.description ?? "",
        nextStep: opportunity.nextStep ?? "",
      });
    }
  }, [opportunity]);

  const updateMutation = api.opportunities.update.useMutation({
    onSuccess: () => {
      utils.opportunities.getById.invalidate({ companyId: params.company, id: params.id });
      utils.opportunities.list.invalidate();
      router.push(`/${params.company}/crm/opportunities/${params.id}`);
    },
    onError: (error) => {
      console.error("Failed to update opportunity:", error);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    updateMutation.mutate({
      companyId: params.company,
      id: params.id,
      name: formData.name,
      stageId: formData.stageId,
      amount: formData.amount ? parseFloat(formData.amount) : undefined,
      forecastCategory: formData.forecastCategory as any,
      expectedCloseDate: formData.expectedCloseDate ? new Date(formData.expectedCloseDate) : undefined,
      description: formData.description || undefined,
      nextStep: formData.nextStep || undefined,
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

  if (!opportunity) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Opportunity not found</p>
        <Link href={`/${params.company}/crm/opportunities`} className="text-sm text-emerald-600 hover:underline mt-2 block">
          Back to opportunities
        </Link>
      </div>
    );
  }

  const stage = pipelineStages?.find((s: any) => s.id === opportunity.stageId);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${params.company}/crm/opportunities/${params.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Edit Opportunity</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm text-gray-500">{opportunity.name}</span>
            {stage && <Badge className="bg-blue-100 text-blue-700">{stage.name}</Badge>}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Opportunity Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Opportunity Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => updateField("amount", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="stageId">Pipeline Stage *</Label>
                <select
                  id="stageId"
                  value={formData.stageId}
                  onChange={(e) => updateField("stageId", e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                  required
                >
                  {pipelineStages?.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="forecastCategory">Forecast Category</Label>
                <select
                  id="forecastCategory"
                  value={formData.forecastCategory}
                  onChange={(e) => updateField("forecastCategory", e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                >
                  {FORECAST_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
                <Input
                  id="expectedCloseDate"
                  type="date"
                  value={formData.expectedCloseDate}
                  onChange={(e) => updateField("expectedCloseDate", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="nextStep">Next Step</Label>
              <Input
                id="nextStep"
                value={formData.nextStep}
                onChange={(e) => updateField("nextStep", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
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
          <Link href={`/${params.company}/crm/opportunities/${params.id}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting || !formData.name || !formData.stageId}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}