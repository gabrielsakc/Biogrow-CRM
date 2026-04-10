"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle, Trash2 } from "lucide-react";
import { api } from "@/lib/trpc/client";
import { Button } from "@biogrow/ui/components/button";
import { Badge } from "@biogrow/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@biogrow/ui/components/card";
import { formatDate } from "@biogrow/ui/lib/utils";

const STATUS_VARIANT: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
  PENDING: "secondary",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  CANCELLED: "danger",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const PRIORITY_VARIANT: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
  LOW: "default",
  MEDIUM: "secondary",
  HIGH: "warning",
  URGENT: "danger",
};

const PRIORITY_LABEL: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export default function TaskDetailPage({ params }: { params: { company: string; id: string } }) {
  const router = useRouter();
  const utils = api.useUtils();

  const { data: task, isLoading } = api.tasks.getById.useQuery({
    companyId: params.company,
    id: params.id,
  });

  const completeMutation = api.tasks.complete.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      utils.tasks.getById.invalidate({ companyId: params.company, id: params.id });
    },
  });

  const deleteMutation = api.tasks.delete.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      router.push(`/${params.company}/crm/tasks`);
    },
  });

  const [isDeleting, setIsDeleting] = useState(false);

  const handleComplete = () => {
    completeMutation.mutate({ companyId: params.company, id: params.id });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this task?")) {
      setIsDeleting(true);
      deleteMutation.mutate({ companyId: params.company, id: params.id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Task not found</p>
        <Link href={`/${params.company}/crm/tasks`} className="text-sm text-emerald-600 hover:underline mt-2 block">
          Back to tasks
        </Link>
      </div>
    );
  }

  const isOverdue = task.dueDate && task.status !== "COMPLETED" && task.status !== "CANCELLED"
    && new Date(task.dueDate) < new Date();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${params.company}/crm/tasks`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{task.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={STATUS_VARIANT[task.status] ?? "default"}>
              {STATUS_LABEL[task.status] ?? task.status}
            </Badge>
            <Badge variant={PRIORITY_VARIANT[task.priority] ?? "default"}>
              {PRIORITY_LABEL[task.priority] ?? task.priority}
            </Badge>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Task Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {task.description && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-700">{task.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Due Date</p>
              <p className={`text-sm ${isOverdue ? "text-red-600 font-medium" : "text-gray-700"}`}>
                {task.dueDate
                  ? formatDate(task.dueDate, { month: "long", day: "numeric", year: "numeric" })
                  : "No due date"}
                {isOverdue && " · Overdue"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Created</p>
              <p className="text-sm text-gray-700">
                {formatDate(task.createdAt, { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>

          {(task as any).lead && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Related Lead</p>
              <Link
                href={`/${params.company}/crm/leads/${(task as any).lead.id}`}
                className="text-sm text-emerald-600 hover:underline"
              >
                {(task as any).lead.firstName} {(task as any).lead.lastName}
              </Link>
            </div>
          )}

          {(task as any).account && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Related Account</p>
              <Link
                href={`/${params.company}/crm/accounts/${(task as any).account.id}`}
                className="text-sm text-emerald-600 hover:underline"
              >
                {(task as any).account.name}
              </Link>
            </div>
          )}

          {(task as any).opportunity && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Related Opportunity</p>
              <Link
                href={`/${params.company}/crm/opportunities/${(task as any).opportunity.id}`}
                className="text-sm text-emerald-600 hover:underline"
              >
                {(task as any).opportunity.name}
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between gap-3">
        <Button
          variant="outline"
          className="text-red-600 hover:text-red-700"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>

        {task.status !== "COMPLETED" && task.status !== "CANCELLED" && (
          <Button onClick={handleComplete} disabled={completeMutation.isPending}>
            <CheckCircle className="h-4 w-4 mr-1" />
            {completeMutation.isPending ? "Completing..." : "Mark Complete"}
          </Button>
        )}
      </div>
    </div>
  );
}