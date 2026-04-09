"use client";

import ReactECharts from "echarts-for-react";
import { formatCurrency } from "@biogrow/ui/lib/utils";
import type { RevenueByMonth } from "@biogrow/crm-core";

interface RevenueTrendChartProps {
  data: RevenueByMonth[];
  currency?: string;
  height?: number;
}

// Format "2024-01" → "Jan"
const MONTH_LABELS: Record<string, string> = {
  "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr",
  "05": "May", "06": "Jun", "07": "Jul", "08": "Aug",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
};

function shortMonth(key: string) {
  const m = key.split("-")[1];
  return m ? (MONTH_LABELS[m] ?? m) : key;
}

export function RevenueTrendChart({ data, currency = "USD", height = 280 }: RevenueTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-gray-400">
        No revenue data
      </div>
    );
  }

  const labels = data.map((d) => shortMonth(d.month));

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
      formatter: (params: any[]) =>
        `<div style="font-size:13px"><strong>${params[0].axisValue}</strong><br/>` +
        params
          .map((p) => `<span style="color:${p.color}">●</span> ${p.seriesName}: <b>${formatCurrency(p.value, currency)}</b>`)
          .join("<br/>") +
        "</div>",
    },
    legend: {
      data: ["Closed Won", "Pipeline"],
      bottom: 0,
      textStyle: { fontSize: 11, color: "#6b7280" },
      icon: "circle",
      itemWidth: 8,
      itemHeight: 8,
    },
    grid: { top: 16, right: 8, bottom: 36, left: 8, containLabel: true },
    xAxis: {
      type: "category",
      data: labels,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 11, color: "#9ca3af" },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        fontSize: 11,
        color: "#9ca3af",
        formatter: (v: number) => formatCurrency(v, currency),
      },
      splitLine: { lineStyle: { color: "#f3f4f6" } },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        name: "Closed Won",
        type: "bar",
        data: data.map((d) => d.closed),
        itemStyle: { color: "#10b981", borderRadius: [4, 4, 0, 0] },
        emphasis: { itemStyle: { color: "#059669" } },
      },
      {
        name: "Pipeline",
        type: "line",
        data: data.map((d) => d.pipeline),
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { color: "#6366f1", width: 2 },
        itemStyle: { color: "#6366f1" },
        areaStyle: { color: "rgba(99,102,241,0.06)" },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height }} notMerge />;
}
