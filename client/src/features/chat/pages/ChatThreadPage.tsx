import { useEffect, useRef, useState, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ArrowLeft, Send, Languages, Mic, Square } from "lucide-react";
import { getMessages, sendMessage, markRead } from "../api/chat.api";
import { translateMessage } from "../api/translation.api";
import { sendVoiceMessage } from "../api/voiceMessage.api";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Skeleton } from "@/components/ui/Skeleton";
import { VoicePlayer } from "@/components/VoicePlayer";

export default function ChatThreadPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const { isRecording, durationSeconds, startRecording, stopRecording } = useVoiceRecorder();

  const { data: messages, isLoading } = useQuery({
    queryKey: ["messages", id],
    queryFn: () => getMessages(id!),
    enabled: Boolean(id),
    refetchInterval: 4000,
  });

  useEffect(() => {
    if (id) markRead(id).then(() => queryClient.invalidateQueries({ queryKey: ["conversations"] }));
  }, [id, messages?.length, queryClient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: (t: string) => sendMessage(id!, t),
    onSuccess: () => {
      setText("");
      queryClient.invalidateQueries({ queryKey: ["messages", id] });
    },
  });

  const voiceMutation = useMutation({
    mutationFn: ({ blob, duration }: { blob: Blob; duration: number }) =>
      sendVoiceMessage(id!, blob, duration),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["messages", id] }),
    onError: () => toast.error("Could not send voice message"),
  });

  const translateMutation = useMutation({
    mutationFn: ({ messageId, target }: { messageId: string; target: "HI" | "EN" }) =>
      translateMessage(messageId, target),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["messages", id] }),
    onError: () => toast.error("Could not translate this message right now"),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    sendMutation.mutate(text.trim());
  }

  async function handleMicClick() {
    if (isRecording) {
      const { blob, durationSeconds: duration } = await stopRecording();
      if (duration < 1) {
        toast.error("Recording too short");
        return;
      }
      voiceMutation.mutate({ blob, duration });
    } else {
      try {
        await startRecording();
      } catch {
        toast.error("Microphone access denied");
      }
    }
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col">
      <div className="flex items-center gap-3 border-b border-ink-100 pb-3">
        <button onClick={() => navigate("/chat")} className="text-ink-500 hover:text-ink-900">
          <ArrowLeft size={20} />
        </button>
        <p className="font-display font-semibold text-ink-900">Chat</p>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto py-4">
        {isLoading ? (
          <Skeleton className="h-32" />
        ) : (
          messages?.map((m) => {
            const isMine = m.sender === user?.id;
            const targetLang = m.originalLanguage === "HI" ? "EN" : "HI";

            return (
              <div key={m._id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    isMine ? "bg-brand-500 text-white" : "bg-ink-100 text-ink-800"
                  }`}
                >
                  {m.type === "VOICE" && m.voiceUrl ? (
                    <VoicePlayer url={m.voiceUrl} durationSeconds={m.voiceDurationSeconds} />
                  ) : (
                    <p>{m.text}</p>
                  )}
                  {m.translatedText && (
                    <p className={`mt-1 border-t pt-1 text-xs ${isMine ? "border-white/30" : "border-ink-300"}`}>
                      {m.translatedText}
                    </p>
                  )}
                  <p className={`mt-1 text-right text-xs ${isMine ? "text-white/70" : "text-ink-400"}`}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>

                {m.type === "TEXT" && !m.translatedText && (
                  <button
                    onClick={() => translateMutation.mutate({ messageId: m._id, target: targetLang })}
                    disabled={translateMutation.isPending}
                    className="mt-1 flex items-center gap-1 text-xs text-ink-400 hover:text-brand-600"
                  >
                    <Languages size={12} /> Translate
                  </button>
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-ink-100 pt-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isRecording ? "Recording…" : "Type a message…"}
          disabled={isRecording}
          className="flex-1 rounded-full border border-ink-200 px-4 py-2.5 text-sm disabled:bg-ink-50"
        />

        <button
          type="button"
          onClick={handleMicClick}
          disabled={voiceMutation.isPending}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            isRecording ? "bg-danger text-white" : "bg-ink-100 text-ink-600"
          }`}
        >
          {isRecording ? <Square size={16} /> : <Mic size={18} />}
        </button>

        {isRecording && (
          <span className="text-xs font-medium text-danger">
            {Math.floor(durationSeconds / 60)}:{String(durationSeconds % 60).padStart(2, "0")}
          </span>
        )}

        <button
          type="submit"
          disabled={sendMutation.isPending || !text.trim() || isRecording}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}