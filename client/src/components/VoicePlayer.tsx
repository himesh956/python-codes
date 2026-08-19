import { useState, useRef } from "react";
import { Play, Pause } from "lucide-react";

/**
 * Minimal playback UI — a single play/pause button plus duration
 * label, no waveform/scrubbing (explicitly out of scope: "do NOT
 * build complicated audio editing"). Uses the native <audio> element.
 */
export function VoicePlayer({ url, durationSeconds }: { url: string; durationSeconds?: number }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function toggle() {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggle}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20"
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
      </button>
      <div className="h-1 flex-1 rounded-full bg-white/30" />
      {durationSeconds !== undefined && (
        <span className="text-xs">
          {Math.floor(durationSeconds / 60)}:{String(durationSeconds % 60).padStart(2, "0")}
        </span>
      )}
      <audio ref={audioRef} src={url} onEnded={() => setIsPlaying(false)} className="hidden" />
    </div>
  );
}