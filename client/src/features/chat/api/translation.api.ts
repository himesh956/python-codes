import { api } from "@/lib/api";
import { Message } from "../types";

export async function translateMessage(
  messageId: string,
  targetLanguage: "HI" | "EN"
): Promise<Message> {
  const res = await api.post(`/chat/messages/${messageId}/translate`, { targetLanguage });
  return res.data.data.message;
}