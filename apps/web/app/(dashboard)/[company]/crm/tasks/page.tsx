import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, CheckSquare } from "lucide-react";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { tasksService } from "@biogrow/crm-core";
import { Button } from "@biogrow/ui/components/button";
import { Badge } from "@biogrow/ui/components/badge";
import { EmptyState } from "@biogrow/ui/feedback/empty-state";
import { Avatar } from "@biogrow/ui/components/avatar";
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

export default async function TasksPage({ params }: { params: { company: string } }) {

  const { company, permissions } = await resolveCompany(params.company);
  if (!hasPermission(permissions, Permissions.CRM_TASKS_VIEW)) {
    redirect(`/${params.company}/dashboard`);
  }

  const { tasks, total } = await tasksService.list({ companyId: company.id, pageSize: 50 });
  const canCreate = hasPermission(permissions, Permissions.CRM_TASKS_CREATE);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} tasks total</p>
        </div>
        {canCreate && (
          <Link href={`/${params.company}/crm/tasks/new`}>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </Link>
        )}
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="h-7 w-7" />}
          title="No tasks yet"
          description="Create tasks to track pending actions on leads, accounts and opportunities."
          action={canCreate ? (
            <Link href={`/${params.company}/crm/tasks/new`}>
              <Button size="sm"><Plus className="h-4 w-4" />Create task</Button>
            </Link>
          ) : undefined}
        />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Task</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Due Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Assignee</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Related to</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tasks.map((task) => {
                const isOverdue = task.dueDate && task.status !== "COMPLETED" && task.status !== "CANCELLED"
                  && new Date(task.dueDate) < new Date();
                return (
                  <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/${params.company}/crm/tasks/${task.id}`}
                        className="font-medium text-gray-900 hover:text-emerald-600 transition-colors"
                      >
                        {task.title}
                      </Link>
                      {task.description && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{task.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={PRIORITY_VARIANT[task.priority] ?? "default"}>
                        {PRIORITY_LABEL[task.priority] ?? task.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[task.status] ?? "default"}>
                        {STATUS_LABEL[task.status] ?? task.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {task.dueDate ? (
                        <span className={`text-xs ${isOverdue ? "text-red-500 font-medium" : "text-gray-500"}`}>
                          {formatDate(task.dueDate, { month: "short", day: "numeric" })}
                          {isOverdue && " · Overdue"}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {(task as any).assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={(task as any).assignee?.avatarUrl}
                            name={(task as any).assignee?.name ?? "?"}
                            size="xs"
                          />
                          <span className="text-xs text-gray-500">{(task as any).assignee?.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {(task as any).lead && (
                        <Link href={`/${params.company}/crm/leads/${(task as any).lead.id}`} className="hover:text-emerald-600 transition-colors">
                          Lead: {(task as any).lead.firstName} {(task as any).lead.lastName}
                        </Link>
                      )}
                      {(task as any).account && (
                        <Link href={`/${params.company}/crm/accounts/${(task as any).account.id}`} className="hover:text-emerald-600 transition-colors">
                          {(task as any).account.name}
                        </Link>
                      )}
                      {(task as any).opportunity && (
                        <Link href={`/${params.company}/crm/opportunities/${(task as any).opportunity.id}`} className="hover:text-emerald-600 transition-colors">
                          Opp: {(task as any).opportunity.name}
                        </Link>
                      )}
                      {!(task as any).lead && !(task as any).account && !(task as any).opportunity && "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
