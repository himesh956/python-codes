import { Readable } from "stream";
import { cloudinary } from "../config/cloudinary";
import { AppError } from "../utils/AppError";

function streamUpload(buffer: Buffer, folder: string): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "video" }, // Cloudinary treats audio under "video" resource_type
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary voice upload failed"));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });
}

/**
 * Reuses the same streamed-upload approach as resume.service.ts —
 * no new upload infrastructure, just a different Cloudinary folder
 * and resource_type. durationSeconds comes from the client (captured
 * via the browser's MediaRecorder timing) since deriving exact audio
 * duration server-side would need an extra ffprobe-style dependency
 * that isn't worth adding for a chat voice note at MVP.
 */
async function upload(file: Express.Multer.File): Promise<{ url: string }> {
  if (!file) throw AppError.badRequest("No voice file provided");
  const { url } = await streamUpload(file.buffer, "localhire/voice-messages");
  return { url };
}

export const voiceMessageService = { upload };