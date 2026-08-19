import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Flag } from "lucide-react";
import { api } from "@/lib/api";

const REASONS = [
  { value: "FAKE_PROFILE", label: "Fake profile" },
  { value: "INAPPROPRIATE_BEHAVIOR", label: "Inappropriate behavior" },
  { value: "SCAM_OR_FRAUD", label: "Scam or fraud" },
  { value: "SPAM", label: "Spam" },
  { value: "OTHER", label: "Other" },
];

interface ReportButtonProps {
  targetType: "USER" | "JOB" | "WORKER_PROFILE";
  targetId: string;
}

export function ReportButton({ targetType, targetId }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("OTHER");
  const [details, setDetails] = useState("");

  const mutation = useMutation({
    mutationFn: () => api.post("/trust-safety/reports", { targetType, targetId, reason, details }),
    onSuccess: () => {
      toast.success("Report submitted");
      setOpen(false);
    },
    onError: () => toast.error("Could not submit report"),
  });

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="flex items-center gap-1 text-xs text-ink-400 hover:text-danger">
        <Flag size={12} /> Report
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-3">
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full rounded-lg border border-ink-200 px-2 py-1.5 text-xs"
      >
        {REASONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="Additional details (optional)"
        rows={2}
        className="mt-2 w-full rounded-lg border border-ink-200 px-2 py-1.5 text-xs"
      />
      <div className="mt-2 flex gap-2">
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="rounded-lg bg-danger px-3 py-1 text-xs font-medium text-white"
        >
          Submit
        </button>
        <button onClick={() => setOpen(false)} className="text-xs text-ink-500">
          Cancel
        </button>
      </div>
    </div>
  );
}