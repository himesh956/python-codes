import multer from "multer";
import { AppError } from "../utils/AppError";

const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Resumes are held in memory only long enough to stream to Cloudinary
 * (see resume.service.ts) — never written to local disk. Only PDFs
 * are accepted; both mimetype and extension are checked since
 * mimetype alone can be spoofed.
 */
const storage = multer.memoryStorage();

function fileFilter(
  _req: unknown,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void {
  const isPdfMime = file.mimetype === "application/pdf";
  const isPdfExt = file.originalname.toLowerCase().endsWith(".pdf");

  if (!isPdfMime || !isPdfExt) {
    cb(new AppError("Only PDF files are allowed for resumes", 400));
    return;
  }
  cb(null, true);
}

export const uploadResume = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_RESUME_SIZE_BYTES, files: 1 },
}).single("resume");
