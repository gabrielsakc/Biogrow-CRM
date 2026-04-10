"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { api } from "@/lib/trpc/client";
import { Button } from "@biogrow/ui/components/button";
import { Input } from "@biogrow/ui/components/input";
import { Label } from "@biogrow/ui/components/label";
import { Textarea } from "@biogrow/ui/components/textarea";
import { Select } from "@biogrow/ui/components/select";
import { Card, CardContent, CardHeader, CardTitle } from "@biogrow/ui/components/card";
import { formatCurrency } from "@biogrow/ui/lib/utils";

const INVESTMENT_TYPES = [
  { value: "EQUIPMENT", label: "Equipment" },
  { value: "PROPERTY", label: "Property" },
  { value: "TECHNOLOGY", label: "Technology" },
  { value: "RESEARCH", label: "Research & Development" },
  { value: "INVENTORY_EXPANSION", label: "Inventory Expansion" },
  { value: "MARKETING", label: "Marketing" },
  { value: "TRAINING", label: "Training" },
  { value: "OTHER", label: "Other" },
];

const RISK_LEVELS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "VERY_HIGH", label: "Very High" },
];

const STATUSES = [
  { value: "PLANNED", label: "Planned" },
  { value: "ACTIVE", label: "Active" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "WRITTEN_OFF", label: "Written Off" },
];

export default function EditInvestmentPage({ params }: { params: { company: string; id: string } }) {
  const router = useRouter();
  const utils = api.useUtils();

  const { data: investment, isLoading } = api.investments.getById.useQuery({
    companyId: params.company,
    id: params.id,
  });

  const [formData, setFormData] = useState({
    name: "",
    type: "EQUIPMENT",
    description: "",
    amount: "",
    currency: "USD",
    investedAt: "",
    expectedReturn: "",
    expectedRoiPct: "",
    actualReturn: "",
    actualRoiPct: "",
    startDate: "",
    endDate: "",
    maturityDate: "",
    status: "PLANNED",
    riskLevel: "MEDIUM",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (investment) {
      setFormData({
        name: investment.name,
        type: investment.type,
        description: investment.description || "",
        amount: investment.amount.toString(),
        currency: investment.currency,
        investedAt: new Date(investment.investedAt).toISOString().split("T")[0],
        expectedReturn: investment.expectedReturn?.toString() || "",
        expectedRoiPct: investment.expectedRoiPct?.toString() || "",
        actualReturn: investment.actualReturn?.toString() || "",
        actualRoiPct: investment.actualRoiPct?.toString() || "",
        startDate: investment.startDate ? new Date(investment.startDate).toISOString().split("T")[0] : "",
        endDate: investment.endDate ? new Date(investment.endDate).toISOString().split("T")[0] : "",
        maturityDate: investment.maturityDate ? new Date(investment.maturityDate).toISOString().split("T")[0] : "",
        status: investment.status,
        riskLevel: investment.riskLevel,
        notes: investment.notes || "",
      });
    }
  }, [investment]);

  const updateMutation = api.investments.update.useMutation({
    onSuccess: () => {
      utils.investments.getById.invalidate({ companyId: params.company, id: params.id });
      utils.investments.list.invalidate();
      router.push(`/${params.company}/finance/investments/${params.id}`);
    },
    onError: (error) => {
      console.error("Failed to update investment:", error);
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
      type: formData.type as any,
      description: formData.description || undefined,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      investedAt: new Date(formData.investedAt),
      expectedReturn: formData.expectedReturn ? parseFloat(formData.expectedReturn) : undefined,
      expectedRoiPct: formData.expectedRoiPct ? parseFloat(formData.expectedRoiPct) : undefined,
      actualReturn: formData.actualReturn ? parseFloat(formData.actualReturn) : undefined,
      actualRoiPct: formData.actualRoiPct ? parseFloat(formData.actualRoiPct) : undefined,
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      maturityDate: formData.maturityDate ? new Date(formData.maturityDate) : undefined,
      status: formData.status as any,
      riskLevel: formData.riskLevel as any,
      notes: formData.notes || undefined,
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

  if (!investment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Investment not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-xl font-bold text-gray-900">Edit Investment</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Investment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onChange={(e) => updateField("type", e.target.value)}
                  options={INVESTMENT_TYPES}
                />
              </div>
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

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => updateField("amount", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => updateField("currency", e.target.value)}
                  maxLength={3}
                />
              </div>
              <div>
                <Label htmlFor="investedAt">Investment Date *</Label>
                <Input
                  id="investedAt"
                  type="date"
                  value={formData.investedAt}
                  onChange={(e) => updateField("investedAt", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expectedReturn">Expected Return</Label>
                <Input
                  id="expectedReturn"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.expectedReturn}
                  onChange={(e) => updateField("expectedReturn", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="expectedRoiPct">Expected ROI (%)</Label>
                <Input
                  id="expectedRoiPct"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1000"
                  value={formData.expectedRoiPct}
                  onChange={(e) => updateField("expectedRoiPct", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="actualReturn">Actual Return</Label>
                <Input
                  id="actualReturn"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.actualReturn}
                  onChange={(e) => updateField("actualReturn", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="actualRoiPct">Actual ROI (%)</Label>
                <Input
                  id="actualRoiPct"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1000"
                  value={formData.actualRoiPct}
                  onChange={(e) => updateField("actualRoiPct", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => updateField("startDate", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => updateField("endDate", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="maturityDate">Maturity Date</Label>
                <Input
                  id="maturityDate"
                  type="date"
                  value={formData.maturityDate}
                  onChange={(e) => updateField("maturityDate", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onChange={(e) => updateField("status", e.target.value)}
                  options={STATUSES}
                />
              </div>
              <div>
                <Label htmlFor="riskLevel">Risk Level</Label>
                <Select
                  value={formData.riskLevel}
                  onChange={(e) => updateField("riskLevel", e.target.value)}
                  options={RISK_LEVELS}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !formData.name || !formData.amount}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}