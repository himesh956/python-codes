export interface ExtractedJobData {
  title?: string;
  category?: string;
  description?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryType?: "DAILY" | "HOURLY" | "MONTHLY" | "PER_JOB";
  location?: string;
  employmentType?: string;
  skills?: string[];
  urgency?: "URGENT" | "NORMAL";
  confidence: "HIGH" | "MEDIUM" | "LOW"; // how much of the above the extractor is confident about
}

export interface IJobExtractionProvider {
  extract(transcript: string): Promise<ExtractedJobData>;
  isAvailable(): boolean;
}