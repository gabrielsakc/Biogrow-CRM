"use client";

import { Card } from "@biogrow/ui/components/card";
import { formatDistanceToNow } from "date-fns";
import { Phone, Mail, Users, FileText } from "lucide-react";

interface RecentActivitiesProps {
  companyId: string;
}

const activities = [
  {
    id: "1",
    type: "call",
    description: "Call with John Smith",
    user: "Maria Garcia",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "2",
    type: "email",
    description: "Email sent to Acme Corp",
    user: "Carlos Lopez",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "3",
    type: "meeting",
    description: "Meeting with Tech Solutions",
    user: "Ana Martinez",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: "4",
    type: "note",
    description: "Note added to opportunity",
    user: "Pedro Sanchez",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
];

const activityIcons = {
  call: Phone,
  email: Mail,
  meeting: Users,
  note: FileText,
};

export function RecentActivities({ companyId }: RecentActivitiesProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Recent Activity
      </h3>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.type as keyof typeof activityIcons];
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Icon className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500">
                  {activity.user} ·{" "}
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}