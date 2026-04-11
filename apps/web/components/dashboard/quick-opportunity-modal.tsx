"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Target } from "lucide-react";
import { api } from "@/lib/trpc/client";
import { Button } from "@biogrow/ui/components/button";
import { Input } from "@biogrow/ui/components/input";
import { Label } from "@biogrow/ui/components/label";

const FORECAST_CATEGORIES = [
  { value: "PIPELINE", label: "Pipeline" },
  { value: "BEST_CASE", label: "Best Case" },
  { value: "COMMIT", label: "Commit" },
];

interface Stage {
  id: string;
  name: string;
  probability: number;
  isWon: boolean;
  isLost: boolean;
}

interface QuickOpportunityModalProps {
  companyId: string;
  companySlug: string;
  stages: Stage[];
  onClose: () => void;
}

export function QuickOpportunityModal({
  companyId,
  companySlug,
  stages,
  onClose,
}: QuickOpportunityModalProps) {
  const router = useRouter();
  const utils = api.useUtils();

  const activeStages = stages.filter((s) => !s.isWon && !s.isLost);
  const defaultStage = activeStages.find((s) => s.name === "Proposal") ?? activeStages[0];

  const [form, setForm] = useState({
    name: "",
    stageId: defaultStage?.id ?? "",
    amount: "",
    forecastCategory: "PIPELINE" as const,
    expectedCloseDate: "",
  });

  const setField = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const mutation = api.opportunities.create.useMutation({
    onSuccess: (opp) => {
      utils.crmDashboard.getKPIs.invalidate({ companyId });
      utils.crmDashboard.getPipelineByStage.invalidate({ companyId });
      router.push(`/${companySlug}/crm/opportunities/${opp.id}`);
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.stageId) return;

    mutation.mutate({
      companyId,
      name: form.name,
      stageId: form.stageId,
      amount: form.amount ? parseFloat(form.amount) : 0,
      forecastCategory: form.forecastCategory,
      expectedCloseDate: form.expectedCloseDate
        ? new Date(form.expectedCloseDate)
        : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-amber-50 flex items-center justify-center">
              <Target className="h-4 w-4 text-amber-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">New Opportunity</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="oppName">Opportunity name *</Label>
            <Input
              id="oppName"
              value={form.name}
              onChange={setField("name")}
              placeholder="e.g., Prime Blocks — Q2 2026 Contract"
              required
              autoFocus
            />
          </div>

          {/* Stage */}
          <div>
            <Label htmlFor="oppStage">Stage *</Label>
            {activeStages.length === 0 ? (
              <p className="text-xs text-red-500 mt-1">
                No pipeline stages configured. Go to Settings → Pipeline to add stages.
              </p>
            ) : (
              <select
                id="oppStage"
                value={form.stageId}
                onChange={setField("stageId")}
                required
                className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                {activeStages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.probability}%)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Amount + Forecast */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="oppAmount">Amount (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <Input
                  id="oppAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={setField("amount")}
                  placeholder="0"
                  className="pl-7"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="oppForecast">Forecast</Label>
              <select
                id="oppForecast"
                value={form.forecastCategory}
                onChange={setField("forecastCategory")}
                className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                {FORECAST_CATEGORIES.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Expected Close Date */}
          <div>
            <Label htmlFor="oppCloseDate">Expected close date</Label>
            <Input
              id="oppCloseDate"
              type="date"
              value={form.expectedCloseDate}
              onChange={setField("expectedCloseDate")}
              min={new Date().toISOString().split("T")[0]}
            />
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
              disabled={mutation.isPending || !form.name || !form.stageId}
            >
              {mutation.isPending ? "Creating..." : "Create Opportunity"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
