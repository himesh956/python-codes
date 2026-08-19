import { useRef, useState, useCallback } from "react";

interface VoiceRecorderState {
  isRecording: boolean;
  durationSeconds: number;
}

/**
 * Wraps the browser's native MediaRecorder API — no external library
 * needed for basic record/stop/blob. Kept deliberately simple per the
 * product brief ("do NOT build complicated audio editing") — just
 * start, stop, and hand back a Blob + duration.
 */
export function useVoiceRecorder() {
  const [state, setState] = useState<VoiceRecorderState>({ isRecording: false, durationSeconds: 0 });
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    startTimeRef.current = Date.now();
    setState({ isRecording: true, durationSeconds: 0 });

    intervalRef.current = setInterval(() => {
      setState((prev) => ({ ...prev, durationSeconds: Math.floor((Date.now() - startTimeRef.current) / 1000) }));
    }, 500);
  }, []);

  const stopRecording = useCallback((): Promise<{ blob: Blob; durationSeconds: number }> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder) {
        resolve({ blob: new Blob(), durationSeconds: 0 });
        return;
      }

      const finalDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        recorder.stream.getTracks().forEach((track) => track.stop());
        if (intervalRef.current) clearInterval(intervalRef.current);
        setState({ isRecording: false, durationSeconds: 0 });
        resolve({ blob, durationSeconds: finalDuration });
      };

      recorder.stop();
    });
  }, []);

  return { ...state, startRecording, stopRecording };
}