"use client";

import { Phone, Mail, Users, FileText, ArrowRight, CheckSquare } from "lucide-react";
import { cn, formatDate } from "@biogrow/ui/lib/utils";
import { Avatar } from "@biogrow/ui/components/avatar";

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Users,
  NOTE: FileText,
  STAGE_CHANGE: ArrowRight,
  TASK_COMPLETED: CheckSquare,
};

const ACTIVITY_COLORS: Record<string, string> = {
  CALL: "bg-blue-100 text-blue-600",
  EMAIL: "bg-purple-100 text-purple-600",
  MEETING: "bg-amber-100 text-amber-600",
  NOTE: "bg-gray-100 text-gray-600",
  STAGE_CHANGE: "bg-emerald-100 text-emerald-600",
  TASK_COMPLETED: "bg-green-100 text-green-600",
};

interface ActivityItem {
  id: string;
  type: string;
  subject: string;
  body?: string | null;
  occurredAt: Date;
  user: { id: string; name: string; avatarUrl: string | null };
  lead?: { id: string; firstName: string; lastName: string } | null;
  account?: { id: string; name: string } | null;
  opportunity?: { id: string; name: string } | null;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  companySlug: string;
  className?: string;
}

export function ActivityFeed({ activities, companySlug, className }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-gray-400">
        No recent activities
      </div>
    );
  }

  return (
    <div className={cn("space-y-0", className)}>
      {activities.map((activity, idx) => {
        const Icon = ACTIVITY_ICONS[activity.type] ?? FileText;
        const colorClass = ACTIVITY_COLORS[activity.type] ?? "bg-gray-100 text-gray-600";
        const isLast = idx === activities.length - 1;

        return (
          <div key={activity.id} className="flex gap-3">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", colorClass)}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              {!isLast && <div className="w-px flex-1 bg-gray-100 my-1" />}
            </div>

            {/* Content */}
            <div className={cn("pb-4 min-w-0 flex-1", isLast && "pb-0")}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{activity.subject}</p>
                  {activity.body && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{activity.body}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar src={activity.user.avatarUrl} name={activity.user.name} size="xs" />
                    <span className="text-xs text-gray-400">{activity.user.name}</span>
                    {activity.account && (
                      <>
                        <span className="text-gray-200">·</span>
                        <span className="text-xs text-gray-400 truncate">{activity.account.name}</span>
                      </>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-400 shrink-0 mt-0.5">
                  {formatDate(activity.occurredAt, { month: "short", day: "numeric" })}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
