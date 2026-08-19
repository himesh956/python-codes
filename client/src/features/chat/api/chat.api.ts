import { api } from "@/lib/api";
import { Conversation, Message } from "../types";

export async function startConversation(payload: {
  otherUserId: string;
  contextType: "BOOKING" | "APPLICATION" | "JOB" | "GENERAL";
  contextId?: string;
}): Promise<Conversation> {
  const res = await api.post("/chat/conversations", payload);
  return res.data.data.conversation;
}

export async function getMyConversations(): Promise<{ conversations: Conversation[]; unreadTotal: number }> {
  const res = await api.get("/chat/conversations");
  return res.data.data;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const res = await api.get(`/chat/conversations/${conversationId}/messages`);
  return res.data.data.messages;
}

export async function sendMessage(conversationId: string, text: string): Promise<Message> {
  const res = await api.post(`/chat/conversations/${conversationId}/messages`, { text });
  return res.data.data.message;
}

export async function markRead(conversationId: string): Promise<void> {
  await api.patch(`/chat/conversations/${conversationId}/read`);
}