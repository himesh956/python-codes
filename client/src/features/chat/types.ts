export interface ChatUser {
  _id: string;
  email: string;
  role: string;
}

export interface Conversation {
  _id: string;
  participants: ChatUser[];
  contextType: "BOOKING" | "APPLICATION" | "JOB" | "GENERAL";
  contextId?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: Record<string, number>;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: string;
  receiver: string;
  type: "TEXT" | "VOICE";
  text?: string;
  originalLanguage?: "HI" | "EN";
  translatedText?: string;
  translatedLanguage?: "HI" | "EN";
  voiceUrl?: string;
  voiceDurationSeconds?: number;
  isRead: boolean;
  createdAt: string;
}