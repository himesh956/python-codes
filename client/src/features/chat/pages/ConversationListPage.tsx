import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { getMyConversations } from "../api/chat.api";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Simple inbox list — WhatsApp-like, no unnecessary chrome. Each row
 * shows the other participant, last message preview, and an unread
 * badge. Polling (30s refetch) stands in for real-time push at MVP —
 * the message model already has everything (timestamps, read state)
 * a Socket.IO layer would need to plug in later without a schema change.
 */
export default function ConversationListPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: getMyConversations,
    refetchInterval: 30000,
  });

  if (isLoading) return <Skeleton className="h-64" />;

  const conversations = data?.conversations ?? [];

  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={<MessageCircle size={32} />}
        title="No messages yet"
        description="Start a conversation from a booking or job page."
      />
    );
  }

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ink-900">Messages</h1>

      <div className="mt-4 space-y-2">
        {conversations.map((c) => {
          const other = c.participants.find((p) => p._id !== user?.id);
          const unread = c.unreadCount[user?.id ?? ""] ?? 0;

          return (
            <Link key={c._id} to={`/chat/${c._id}`}>
              <Card hoverable className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink-900">{other?.email ?? "User"}</p>
                  <p className="truncate text-sm text-ink-500">{c.lastMessage ?? "No messages yet"}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {c.lastMessageAt && (
                    <span className="text-xs text-ink-400">
                      {new Date(c.lastMessageAt).toLocaleDateString()}
                    </span>
                  )}
                  {unread > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-500 px-1.5 text-xs font-semibold text-white">
                      {unread}
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}