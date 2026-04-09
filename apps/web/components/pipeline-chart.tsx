"use client";

import { Card } from "@biogrow/ui/components/card";

interface PipelineChartProps {
  companyId: string;
}

export function PipelineChart({ companyId }: PipelineChartProps) {
  // TODO: Fetch real pipeline data

  const stages = [
    { name: "Prospect", value: 45, amount: "$125,000" },
    { name: "Qualified", value: 32, amount: "$89,000" },
    { name: "Proposal", value: 18, amount: "$156,000" },
    { name: "Negotiation", value: 8, amount: "$67,000" },
    { name: "Closed", value: 5, amount: "$45,000" },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Sales Pipeline
      </h3>
      <div className="space-y-4">
        {stages.map((stage, index) => (
          <div key={stage.name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">{stage.name}</span>
              <span className="text-sm font-medium text-gray-900">
                {stage.amount}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{
                  width: `${(stage.value / 50) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}