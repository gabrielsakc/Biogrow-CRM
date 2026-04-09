import * as React from "react";
import { Skeleton } from "../components/skeleton";

/** KPI card loading state */
function KPICardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-12 w-12 rounded-lg" />
      </div>
    </div>
  );
}

/** Dashboard grid of KPI card skeletons */
function DashboardSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: cards }).map((_, i) => (
        <KPICardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Table loading state */
function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-100 px-6 py-4 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-gray-50 px-6 py-4 flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" style={{ opacity: 1 - i * 0.08 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Single-line content skeleton */
function InlineSkeleton({ width = "w-32" }: { width?: string }) {
  return <Skeleton className={`h-4 ${width}`} />;
}

export { KPICardSkeleton, DashboardSkeleton, TableSkeleton, InlineSkeleton };
