"use client";

import { useState } from "react";
import { setExamMode } from "~/app/(withAuth)/(withDashboard)/playlists/[id]/[playlistItemId]/actions";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";

interface ExamModeToggleProps {
  initialExamMode: boolean;
}

export default function ExamModeToggle({
  initialExamMode,
}: ExamModeToggleProps) {
  const [examMode, setExamModeState] = useState(initialExamMode);

  const handleExamModeChange = async (checked: boolean) => {
    setExamModeState(checked);
    await setExamMode(checked);
  };

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="exam-mode">Modo Prova</Label>
      <Switch
        id="exam-mode"
        checked={examMode}
        onCheckedChange={handleExamModeChange}
      />
    </div>
  );
}
