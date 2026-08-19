import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Phone } from "lucide-react";
import { initiateCall } from "@/features/calling/api/calling.api";

interface CallButtonProps {
  receiverId: string;
  contextType: "BOOKING" | "APPLICATION";
  contextId: string;
}

/**
 * Never displays or requests a phone number — the button itself is
 * the entire interface. Since MockCallingProvider currently reports
 * unavailable, this honestly tells the user calling isn't ready yet
 * and points them at chat instead, rather than pretending to dial.
 */
export function CallButton({ receiverId, contextType, contextId }: CallButtonProps) {
  const mutation = useMutation({
    mutationFn: () => initiateCall({ receiverId, contextType, contextId }),
    onError: (err) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Could not start the call.";
      toast.error(message);
    },
  });

  return (
    <button
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className="flex items-center gap-1.5 rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-50"
    >
      <Phone size={16} /> Call
    </button>
  );
}