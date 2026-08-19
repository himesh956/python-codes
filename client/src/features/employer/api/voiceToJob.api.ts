import { api } from "@/lib/api";

export interface ExtractedJobData {
  title?: string;
  category?: string;
  description?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryType?: "DAILY" | "HOURLY" | "MONTHLY" | "PER_JOB";
  location?: string;
  employmentType?: string;
  urgency?: "URGENT" | "NORMAL";
  confidence: "HIGH" | "MEDIUM" | "LOW";
}

export async function processTranscript(
  transcript: string
): Promise<{ transcript: string; extracted: ExtractedJobData }> {
  const res = await api.post("/voice-to-job/process-transcript", { transcript });
  return res.data.data;
}