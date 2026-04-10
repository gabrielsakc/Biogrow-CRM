"use client";

import { useState } from "react";
import { X, Phone, Mail, Users, FileText } from "lucide-react";
import { api } from "@/lib/trpc/client";
import { Button } from "@biogrow/ui/components/button";
import { Input } from "@biogrow/ui/components/input";
import { Label } from "@biogrow/ui/components/label";
import { Textarea } from "@biogrow/ui/components/textarea";

const ACTIVITY_TYPES = [
  { value: "CALL", label: "Call", icon: Phone },
  { value: "EMAIL", label: "Email", icon: Mail },
  { value: "MEETING", label: "Meeting", icon: Users },
  { value: "NOTE", label: "Note", icon: FileText },
];

interface LogActivityModalProps {
  companyId: string;
  companySlug: string;
  leadId?: string;
  accountId?: string;
  contactId?: string;
  opportunityId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LogActivityModal({
  companyId,
  companySlug,
  leadId,
  accountId,
  contactId,
  opportunityId,
  onClose,
  onSuccess,
}: LogActivityModalProps) {
  const utils = api.useUtils();

  const [formData, setFormData] = useState({
    type: "NOTE" as "CALL" | "EMAIL" | "MEETING" | "NOTE",
    subject: "",
    body: "",
    outcome: "",
    durationMin: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMutation = api.activities.create.useMutation({
    onSuccess: () => {
      if (leadId) utils.activities.list.invalidate({ companyId, leadId });
      if (accountId) utils.activities.list.invalidate({ companyId, accountId });
      if (contactId) utils.activities.list.invalidate({ companyId, contactId });
      if (opportunityId) utils.activities.list.invalidate({ companyId, opportunityId });
      utils.activities.listRecent.invalidate({ companyId });
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      console.error("Failed to log activity:", error);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    createMutation.mutate({
      companyId,
      type: formData.type,
      subject: formData.subject,
      body: formData.body || undefined,
      outcome: formData.outcome || undefined,
      durationMin: formData.durationMin ? parseInt(formData.durationMin) : undefined,
      leadId,
      accountId,
      contactId,
      opportunityId,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Log Activity</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Activity Type */}
          <div>
            <Label>Type</Label>
            <div className="grid grid-cols-4 gap-2 mt-1.5">
              {ACTIVITY_TYPES.map((t) => {
                const Icon = t.icon;
                const isSelected = formData.type === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, type: t.value as any }))}
                    className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg border text-xs font-medium transition-colors ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject */}
          <div>
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
              placeholder="e.g., Follow-up call with decision maker"
              required
            />
          </div>

          {/* Body */}
          <div>
            <Label htmlFor="body">Details</Label>
            <Textarea
              id="body"
              value={formData.body}
              onChange={(e) => setFormData((prev) => ({ ...prev, body: e.target.value }))}
              placeholder="What was discussed? Any important notes?"
              rows={3}
            />
          </div>

          {/* Outcome & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="outcome">Outcome</Label>
              <Input
                id="outcome"
                value={formData.outcome}
                onChange={(e) => setFormData((prev) => ({ ...prev, outcome: e.target.value }))}
                placeholder="e.g., Positive, needs follow-up"
              />
            </div>
            {(formData.type === "CALL" || formData.type === "MEETING") && (
              <div>
                <Label htmlFor="durationMin">Duration (min)</Label>
                <Input
                  id="durationMin"
                  type="number"
                  min="1"
                  value={formData.durationMin}
                  onChange={(e) => setFormData((prev) => ({ ...prev, durationMin: e.target.value }))}
                  placeholder="15"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.subject}>
              {isSubmitting ? "Saving..." : "Log Activity"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}