import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { MessageCircle } from "lucide-react";
import { startConversation } from "@/features/chat/api/chat.api";

interface ChatButtonProps {
  otherUserId: string;
  contextType: "BOOKING" | "APPLICATION" | "JOB" | "GENERAL";
  contextId?: string;
  label?: string;
}

/**
 * Drop-in "Message" button used from booking detail / worker profile
 * pages — starts (or resumes) the conversation and navigates straight
 * into the thread, so the caller never has to think about conversation
 * IDs.
 */
export function ChatButton({ otherUserId, contextType, contextId, label = "Message" }: ChatButtonProps) {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () => startConversation({ otherUserId, contextType, contextId }),
    onSuccess: (conversation) => navigate(`/chat/${conversation._id}`),
    onError: () => toast.error("Could not start conversation"),
  });

  return (
    <button
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className="flex items-center gap-1.5 rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-50"
    >
      <MessageCircle size={16} /> {label}
    </button>
  );
}