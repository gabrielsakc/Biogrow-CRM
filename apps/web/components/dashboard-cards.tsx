"use client";

import { Card } from "@biogrow/ui/components/card";
import {
  DollarSign,
  Users,
  Target,
  TrendingUp
} from "lucide-react";

interface DashboardCardsProps {
  companyId: string;
}

export function DashboardCards({ companyId }: DashboardCardsProps) {
  // TODO: Fetch real data from API

  const cards = [
    {
      title: "Monthly Revenue",
      value: "$125,430",
      change: "+12.5%",
      changeType: "positive" as const,
      icon: DollarSign,
    },
    {
      title: "New Leads",
      value: "45",
      change: "+8",
      changeType: "positive" as const,
      icon: Users,
    },
    {
      title: "Pipeline Total",
      value: "$340,200",
      change: "+23.1%",
      changeType: "positive" as const,
      icon: Target,
    },
    {
      title: "Conversion Rate",
      value: "24.8%",
      change: "-2.1%",
      changeType: "negative" as const,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {card.value}
              </p>
              <p
                className={`text-sm mt-1 ${
                  card.changeType === "positive"
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {card.change}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center">
              <card.icon className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}