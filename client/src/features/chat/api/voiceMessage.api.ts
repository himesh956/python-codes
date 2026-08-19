import { api } from "@/lib/api";
import { Message } from "../types";

export async function sendVoiceMessage(
  conversationId: string,
  blob: Blob,
  durationSeconds: number
): Promise<Message> {
  const formData = new FormData();
  formData.append("voice", blob, "voice-message.webm");
  formData.append("durationSeconds", String(durationSeconds));

  const res = await api.post(`/chat/conversations/${conversationId}/voice-messages`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data.message;
}