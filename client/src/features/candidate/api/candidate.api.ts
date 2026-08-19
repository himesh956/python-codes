import { api } from "@/lib/api";
import { CandidateProfile, UpdateProfilePayload } from "../types";

export async function getMyCandidateProfile(): Promise<{
  profile: CandidateProfile;
  profileCompletion: number;
}> {
  const res = await api.get("/candidates/profile");
  return res.data.data;
}

export async function updateMyCandidateProfile(
  payload: UpdateProfilePayload
): Promise<CandidateProfile> {
  const res = await api.put("/candidates/profile", payload);
  return res.data.data.profile;
}

export async function uploadResume(file: File): Promise<{ url: string; fileName: string }> {
  const formData = new FormData();
  formData.append("resume", file);
  const res = await api.post("/candidates/resume", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data.resume;
}