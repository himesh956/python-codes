import { Types } from "mongoose";
import { Readable } from "stream";
import { cloudinary } from "../config/cloudinary";
import { Resume } from "../models/Resume";
import { CandidateProfile } from "../models/CandidateProfile";
import { AppError } from "../utils/AppError";

function streamUpload(buffer: Buffer, folder: string): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "raw", format: "pdf" },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });
}

/**
 * Uploads a new resume for the candidate and swaps it in as their
 * active resume, deleting the previous file from Cloudinary (if any)
 * so we don't accumulate orphaned files. Old Resume documents are
 * removed too — if we later want history we can soft-delete instead,
 * but for now candidates only ever have one active resume.
 */
async function uploadForCandidate(
  candidateProfileId: string,
  file: Express.Multer.File
): Promise<{ id: string; url: string; fileName: string }> {
  const profile = await CandidateProfile.findById(candidateProfileId);
  if (!profile) {
    throw AppError.notFound("Candidate profile not found");
  }

  const { url, publicId } = await streamUpload(file.buffer, "localhire/resumes");

  const resume = await Resume.create({
    candidate: profile._id,
    cloudinaryUrl: url,
    cloudinaryPublicId: publicId,
    fileName: file.originalname,
    fileSizeBytes: file.size,
  });

  const previousResumeId = profile.resume;
  profile.resume = resume._id as Types.ObjectId;
  await profile.save();

  if (previousResumeId) {
    await deleteResumeRecord(previousResumeId.toString());
  }

  return { id: resume._id.toString(), url: resume.cloudinaryUrl, fileName: resume.fileName };
}

async function deleteForCandidate(candidateProfileId: string): Promise<void> {
  const profile = await CandidateProfile.findById(candidateProfileId);
  if (!profile) {
    throw AppError.notFound("Candidate profile not found");
  }
  if (!profile.resume) {
    throw AppError.notFound("No resume on file");
  }

  const resumeId = profile.resume.toString();
  profile.resume = null;
  await profile.save();
  await deleteResumeRecord(resumeId);
}

async function deleteResumeRecord(resumeId: string): Promise<void> {
  const resume = await Resume.findById(resumeId);
  if (!resume) return;

  await cloudinary.uploader.destroy(resume.cloudinaryPublicId, { resource_type: "raw" });
  await resume.deleteOne();
}

export const resumeService = { uploadForCandidate, deleteForCandidate };
