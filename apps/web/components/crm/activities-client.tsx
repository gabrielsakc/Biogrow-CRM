"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@biogrow/ui/components/button";
import { LogActivityModal } from "./log-activity-modal";

interface ActivitiesClientProps {
  companyId: string;
  companySlug: string;
  canCreate: boolean;
}

export function ActivitiesClient({ companyId, companySlug, canCreate }: ActivitiesClientProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {canCreate && (
        <Button size="sm" onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          Log Activity
        </Button>
      )}

      {showModal && (
        <LogActivityModal
          companyId={companyId}
          companySlug={companySlug}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            // Refresh the page to show new activity
            window.location.reload();
          }}
        />
      )}
    </>
  );
}