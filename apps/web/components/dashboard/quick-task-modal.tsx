"use client";

import { useState } from "react";
import { X, CheckSquare } from "lucide-react";
import { api } from "@/lib/trpc/client";
import { Button } from "@biogrow/ui/components/button";
import { Input } from "@biogrow/ui/components/input";
import { Label } from "@biogrow/ui/components/label";
import { Textarea } from "@biogrow/ui/components/textarea";

const PRIORITIES = [
  { value: "LOW", label: "Low", color: "text-gray-500" },
  { value: "MEDIUM", label: "Medium", color: "text-blue-600" },
  { value: "HIGH", label: "High", color: "text-amber-600" },
  { value: "URGENT", label: "Urgent", color: "text-red-600" },
];

interface QuickTaskModalProps {
  companyId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function QuickTaskModal({ companyId, onClose, onSuccess }: QuickTaskModalProps) {
  const utils = api.useUtils();

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    dueDate: "",
  });

  const setField = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const mutation = api.tasks.create.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate({ companyId });
      utils.crmDashboard.getKPIs.invalidate({ companyId });
      onSuccess?.();
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      companyId,
      title: form.title,
      description: form.description || undefined,
      priority: form.priority,
      dueDate: form.dueDate ? new Date(form.dueDate) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckSquare className="h-4 w-4 text-emerald-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">New Task</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="taskTitle">Title *</Label>
            <Input
              id="taskTitle"
              value={form.title}
              onChange={setField("title")}
              placeholder="e.g., Follow up with client on proposal"
              required
              autoFocus
            />
          </div>

          {/* Priority + Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="taskPriority">Priority</Label>
              <select
                id="taskPriority"
                value={form.priority}
                onChange={setField("priority")}
                className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="taskDueDate">Due date</Label>
              <Input
                id="taskDueDate"
                type="date"
                value={form.dueDate}
                onChange={setField("dueDate")}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="taskDescription">Description</Label>
            <Textarea
              id="taskDescription"
              value={form.description}
              onChange={setField("description")}
              placeholder="Additional details about this task..."
              rows={3}
            />
          </div>

          {/* Error */}
          {mutation.error && (
            <p className="text-xs text-red-600 bg-red-50 rounded px-3 py-2">
              {mutation.error.message}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending || !form.title}
            >
              {mutation.isPending ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
