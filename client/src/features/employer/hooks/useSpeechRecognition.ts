import { useState, useRef, useCallback } from "react";

/**
 * Wraps the browser's native SpeechRecognition API (webkitSpeechRecognition
 * on Chrome/Android, which covers the overwhelming majority of the
 * target user's devices) — this is what actually converts speech to
 * text client-side, since no server-side STT provider is configured
 * yet (see mockSpeechToTextProvider.ts). If the browser doesn't
 * support it, isSupported is false and the UI falls back to the
 * manual form entirely.
 */
export function useSpeechRecognition(language: "hi-IN" | "en-IN" = "hi-IN") {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const SpeechRecognitionCtor =
    (window as unknown as { SpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ??
    (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;

  const isSupported = Boolean(SpeechRecognitionCtor);

  const start = useCallback(() => {
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(" ");
      setTranscript(text);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setTranscript("");
  }, [SpeechRecognitionCtor, language]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isSupported, isListening, transcript, start, stop };
}