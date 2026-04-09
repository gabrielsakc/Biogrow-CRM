"use client";

import ReactECharts from "echarts-for-react";
import { formatCurrency, formatCompact } from "@biogrow/ui/lib/utils";
import type { PipelineByStage } from "@biogrow/crm-core";

interface CRMFunnelChartProps {
  data: PipelineByStage[];
  currency?: string;
  height?: number;
}

export function CRMFunnelChart({ data, currency = "USD", height = 280 }: CRMFunnelChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-gray-400">
        No pipeline data
      </div>
    );
  }

  const option = {
    tooltip: {
      trigger: "item",
      formatter: (params: any) => {
        const item = data.find((d) => d.stageName === params.name);
        if (!item) return params.name;
        return `
          <div style="font-size:13px">
            <strong>${params.name}</strong><br/>
            Opportunities: <b>${item.count}</b><br/>
            Value: <b>${formatCurrency(item.totalValue, currency)}</b><br/>
            Weighted: <b>${formatCurrency(item.weightedValue, currency)}</b>
          </div>
        `;
      },
    },
    series: [
      {
        type: "funnel",
        left: "10%",
        width: "80%",
        minSize: "10%",
        maxSize: "100%",
        sort: "none",
        gap: 4,
        label: {
          show: true,
          position: "inside",
          formatter: (params: any) => {
            const item = data.find((d) => d.stageName === params.name);
            if (!item) return params.name;
            return `{name|${params.name}}\n{value|${formatCurrency(item.totalValue, currency)}}`;
          },
          rich: {
            name: { fontSize: 11, color: "#fff", fontWeight: "600" },
            value: { fontSize: 11, color: "rgba(255,255,255,0.85)" },
          },
        },
        itemStyle: {
          borderWidth: 0,
          borderRadius: 4,
        },
        emphasis: {
          label: { fontSize: 13 },
          itemStyle: { opacity: 0.85 },
        },
        data: data.map((stage, idx) => ({
          name: stage.stageName,
          value: stage.count || 0.01, // prevent zero-height
          itemStyle: {
            color: stage.stageColor || `hsl(${160 + idx * 25}, 70%, 45%)`,
          },
        })),
      },
    ],
  };

  return <ReactECharts option={option} style={{ height }} notMerge />;
}
