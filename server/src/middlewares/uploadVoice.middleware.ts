import multer from "multer";
import { AppError } from "../utils/AppError";

const MAX_VOICE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB — a few minutes of compressed audio is plenty for a chat voice note

/**
 * Reuses the exact same memory-storage pattern as resume upload
 * (upload.middleware.ts) — no disk writes, streamed straight to
 * Cloudinary. Accepts common audio formats a browser MediaRecorder
 * would produce (webm/ogg) plus mp3/wav/m4a for broader device support.
 */
const storage = multer.memoryStorage();

const ALLOWED_AUDIO_MIME_TYPES = [
  "audio/webm",
  "audio/ogg",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/mp4",
  "audio/x-m4a",
];

function fileFilter(
  _req: unknown,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void {
  if (!ALLOWED_AUDIO_MIME_TYPES.includes(file.mimetype)) {
    cb(new AppError("Only audio files are allowed for voice messages", 400));
    return;
  }
  cb(null, true);
}

export const uploadVoiceMessage = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_VOICE_SIZE_BYTES, files: 1 },
}).single("voice");