"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@biogrow/ui/components/card";
import { cn, formatCurrency, formatCompact } from "@biogrow/ui/lib/utils";

interface KPICardProps {
  title: string;
  value: number | string;
  format?: "currency" | "number" | "percent" | "raw";
  currency?: string;
  delta?: number;        // absolute change
  deltaPercent?: number; // % change vs previous period
  period?: string;       // e.g. "vs last month"
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
}

export function KPICard({
  title,
  value,
  format = "number",
  currency = "USD",
  delta,
  deltaPercent,
  period = "vs prior month",
  icon: Icon,
  iconColor = "text-emerald-600",
  iconBg = "bg-emerald-50",
}: KPICardProps) {
  const formatted =
    typeof value === "string"
      ? value
      : format === "currency"
      ? formatCurrency(value, currency)
      : format === "percent"
      ? `${value.toFixed(1)}%`
      : formatCompact(value);

  const deltaVal = deltaPercent ?? (delta !== undefined && typeof value === "number" && value > 0
    ? Math.round((delta / (value - delta)) * 100)
    : undefined);

  const direction =
    deltaVal === undefined ? "flat" : deltaVal > 0 ? "up" : deltaVal < 0 ? "down" : "flat";

  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{formatted}</p>
            {deltaVal !== undefined && (
              <div className="flex items-center gap-1">
                {direction === "up" && <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />}
                {direction === "down" && <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
                {direction === "flat" && <Minus className="h-3.5 w-3.5 text-gray-400" />}
                <span
                  className={cn(
                    "text-xs font-medium",
                    direction === "up" && "text-emerald-600",
                    direction === "down" && "text-red-600",
                    direction === "flat" && "text-gray-400"
                  )}
                >
                  {deltaVal > 0 ? "+" : ""}{deltaVal}%
                </span>
                <span className="text-xs text-gray-400">{period}</span>
              </div>
            )}
          </div>
          <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
