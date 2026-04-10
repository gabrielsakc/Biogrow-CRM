"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/trpc/client";
import { Button } from "@biogrow/ui/components/button";
import { Input } from "@biogrow/ui/components/input";
import { Label } from "@biogrow/ui/components/label";
import { Textarea } from "@biogrow/ui/components/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@biogrow/ui/components/card";

const FORECAST_OPTIONS = [
  { value: "PIPELINE", label: "Pipeline" },
  { value: "BEST_CASE", label: "Best Case" },
  { value: "COMMIT", label: "Commit" },
  { value: "OMITTED", label: "Omitted" },
];

export default function NewOpportunityPage({ params }: { params: { company: string } }) {
  const router = useRouter();
  const utils = api.useUtils();

  const { data: pipelineStages } = api.pipeline.getStages.useQuery({
    companyId: params.company,
  });

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    stageId: "",
    accountId: "",
    contactId: "",
    forecastCategory: "PIPELINE",
    expectedCloseDate: "",
    description: "",
    nextStep: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (pipelineStages && pipelineStages.length > 0 && !formData.stageId) {
      const firstStage = pipelineStages.find((s: any) => !s.isWon && !s.isLost) || pipelineStages[0];
      setFormData((prev) => ({ ...prev, stageId: firstStage.id }));
    }
  }, [pipelineStages]);

  const createMutation = api.opportunities.create.useMutation({
    onSuccess: () => {
      utils.opportunities.list.invalidate();
      router.push(`/${params.company}/crm/opportunities`);
    },
    onError: (error) => {
      console.error("Failed to create opportunity:", error);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    createMutation.mutate({
      companyId: params.company,
      name: formData.name,
      stageId: formData.stageId,
      amount: formData.amount ? parseFloat(formData.amount) : 0,
      forecastCategory: formData.forecastCategory as any,
      expectedCloseDate: formData.expectedCloseDate ? new Date(formData.expectedCloseDate) : undefined,
      description: formData.description || undefined,
      nextStep: formData.nextStep || undefined,
    });
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${params.company}/crm/opportunities`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">New Opportunity</h1>
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
                placeholder="e.g., ABC Corp - Software Deal"
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
                  placeholder="0.00"
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
                  {pipelineStages?.map((stage: any) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
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
                placeholder="e.g., Schedule demo call"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Additional details about this opportunity..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Link href={`/${params.company}/crm/opportunities`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting || !formData.name || !formData.stageId}>
            {isSubmitting ? "Creating..." : "Create Opportunity"}
          </Button>
        </div>
      </form>
    </div>
  );
}