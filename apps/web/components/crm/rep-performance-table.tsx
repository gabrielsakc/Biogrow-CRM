"use client";

import { Avatar } from "@biogrow/ui/components/avatar";
import { formatCurrency } from "@biogrow/ui/lib/utils";
import type { RepPerformance } from "@biogrow/crm-core";

interface RepPerformanceTableProps {
  data: RepPerformance[];
  currency?: string;
}

export function RepPerformanceTable({ data, currency = "USD" }: RepPerformanceTableProps) {
  if (data.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-400">
        Sin datos de performance este mes
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-2 pr-4 font-medium text-gray-500 text-xs uppercase tracking-wide">Vendedor</th>
            <th className="text-right py-2 px-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Opps</th>
            <th className="text-right py-2 px-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Pipeline</th>
            <th className="text-right py-2 px-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Cerrado</th>
            <th className="text-right py-2 pl-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Actividades</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((rep) => (
            <tr key={rep.userId} className="hover:bg-gray-50 transition-colors">
              <td className="py-2.5 pr-4">
                <div className="flex items-center gap-2">
                  <Avatar src={rep.avatarUrl} name={rep.userName} size="sm" />
                  <span className="font-medium text-gray-900 truncate max-w-[140px]">
                    {rep.userName}
                  </span>
                </div>
              </td>
              <td className="py-2.5 px-3 text-right tabular-nums text-gray-700">
                {rep.openOpportunities}
              </td>
              <td className="py-2.5 px-3 text-right tabular-nums text-gray-700">
                {formatCurrency(rep.pipelineValue, currency)}
              </td>
              <td className="py-2.5 px-3 text-right tabular-nums font-medium text-emerald-600">
                {rep.closedWonThisMonth > 0 ? formatCurrency(rep.closedWonThisMonth, currency) : "—"}
              </td>
              <td className="py-2.5 pl-3 text-right tabular-nums text-gray-700">
                {rep.activitiesThisWeek}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
